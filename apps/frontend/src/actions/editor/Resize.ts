import { editorStore } from '@/lib/Editor/Models';
import { handleParentCollisions } from '@/lib/Editor/collisions';
import { Point } from '@/types';
import { WebloomGridDimensions } from '@/lib/Editor/interface';

import { normalize } from '@/lib/Editor/utils';
import { throttle } from 'lodash';
import { Command, UndoableCommand, UpdateNodesPayload } from '../types';
import { NilefyWidgets } from '@/pages/Editor/Components';
import { SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

type MainResizingKeys = 'top' | 'bottom' | 'left' | 'right';
type CornerResizingKeys =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type ResizingKeys = MainResizingKeys | CornerResizingKeys;

class ResizeAction {
  public static resizingKey: ResizingKeys | null = null;
  private static direction: MainResizingKeys[];
  private static orginalPositions: Record<string, WebloomGridDimensions> = {};
  private static collidingNodes: Set<string> = new Set<string>();
  private static initialDimensions: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  private static initialGridPosition: WebloomGridDimensions;
  private static id: string | null = null;
  private static _start(
    id: string,
    key: ResizingKeys,
    dimensions: {
      width: number;
      height: number;
      x: number;
      y: number;
    },
  ) {
    this.id = id;
    this.resizingKey = key;
    this.direction = key.split('-') as MainResizingKeys[];
    const positionsSnapshot = editorStore.currentPage
      .snapshotWidgets()
      .reduce((acc, node) => {
        return {
          ...acc,
          [node.id]: {
            col: node.col,
            row: node.row,
            columnsCount: node.columnsCount,
            rowsCount: node.rowsCount,
          },
        };
      }, {});

    this.orginalPositions = positionsSnapshot;
    this.initialGridPosition =
      editorStore.currentPage.getWidgetById(id).gridDimensions;
    this.initialDimensions = dimensions;
    editorStore.currentPage.setResizedWidgetId(id);
  }
  public static start(
    ...args: Parameters<typeof ResizeAction._start>
  ): Command {
    return {
      execute: () => {
        this._start(...args);
      },
    };
  }

  private static calculateNewDimensions(
    mousePosition: Point,
    id: string,
    initialDimensions: {
      width: number;
      height: number;
      x: number;
      y: number;
    },
    direction: MainResizingKeys[],
    resizingKey: ResizingKeys | null,
  ) {
    if (resizingKey === null) return;
    const root = editorStore.currentPage.rootWidget;
    if (!root.canvas) return;

    const { width: initialWidth, height: initialHeight } = initialDimensions;
    const { x: initialLeft, y: initialTop } = initialDimensions;
    const initialRight = initialLeft + initialWidth;
    const initialBottom = initialTop + initialHeight;
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newLeft = initialLeft;
    let newTop = initialTop;

    let { x, y } = mousePosition;
    const rect = root.canvas.getBoundingClientRect();
    if (!rect) return;
    x -= rect.left;
    y -= rect.top; // -> so that we get the mousePos relative to the root element
    const node = editorStore.currentPage.getWidgetById(id);

    const [gridRow, gridCol] = node.gridSize;
    const config = NilefyWidgets[node.type].config.layoutConfig;
    const minWidth = gridCol * (config.minColumns ?? 2);
    const minHeight = gridRow * (config.minRows ?? 10);
    if (direction.includes('top')) {
      const diff = initialTop - y;
      const snappedDiff = Math.round(normalize(diff, gridRow));
      newHeight += snappedDiff;
      newTop -= snappedDiff;
      if (newHeight < minHeight) {
        newHeight = minHeight;
        newTop = initialTop + initialHeight - minHeight;
      }
    } else if (direction.includes('bottom')) {
      const diff = y - initialBottom;
      const snappedDiff = Math.round(normalize(diff, gridRow));
      newHeight += snappedDiff;
      if (newHeight < minHeight) {
        newHeight = minHeight;
      }
    }
    if (direction.includes('left')) {
      const diff = initialLeft - x;
      const snappedDiff = Math.round(normalize(diff, gridCol));
      newWidth += snappedDiff;
      newLeft -= snappedDiff;
      if (newWidth < minWidth) {
        newWidth = minWidth;
        newLeft = initialLeft + initialWidth - minWidth;
      }
    } else if (direction.includes('right')) {
      const diff = x - initialRight;
      const snappedDiff = Math.round(normalize(diff, gridCol));
      newWidth += snappedDiff;
      if (newWidth < minWidth) {
        newWidth = minWidth;
      }
    }

    //width = rowsCount * rowSize -> rowsCount = width/rowSize
    const parent = node.parent.pixelDimensions;
    newLeft -= parent.x;
    newTop -= parent.y;
    const colCount = Math.round(newWidth / gridCol);
    const rowCount = Math.round(newHeight / gridRow);
    const newX = Math.round(newLeft / gridCol);
    const newY = Math.round(newTop / gridRow);

    return {
      rowsCount: rowCount,
      columnsCount: colCount,
      x: newX,
      y: newY,
    };
  }

  private static _move(mousePosition: Point) {
    if (!this.id) return;
    const dims = this.calculateNewDimensions(
      mousePosition,
      this.id,
      this.initialDimensions,
      this.direction,
      this.resizingKey,
    );
    if (!dims) return;

    this.returnToOriginalPosition();
    this.returnToInitialDimensions();
    const newCollisions = this._resize(this.id, dims);
    for (const collison of newCollisions) {
      this.collidingNodes.add(collison);
    }
    // filter elements that returned to their original position
    Object.entries(this.orginalPositions).forEach(([id, pos]) => {
      const tempWidget = editorStore.currentPage.getWidgetById(id);
      if (
        pos.row === tempWidget.row &&
        pos.rowsCount === tempWidget.rowsCount
      ) {
        this.collidingNodes.delete(id);
      }
    });
  }

  public static move(
    ...args: Parameters<typeof ResizeAction._move>
  ): Command | null {
    if (this.resizingKey === null) return null;
    if (this.id === null) return null;
    if (!this.initialDimensions) return null;
    return {
      execute: () => {
        this.throttledMove(...args);
      },
    };
  }

  private static cleanUp() {
    this.resizingKey = null;
    this.id = null;
    this.direction = [];
    this.initialDimensions = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    };
    this.orginalPositions = {};
    this.collidingNodes = new Set<string>();
  }

  private static returnToOriginalPosition() {
    this.collidingNodes.forEach((id) => {
      if (id === this.id) return;
      const pos = this.orginalPositions[id];
      editorStore.currentPage.getWidgetById(id).setDimensions(pos);
    });
  }

  private static returnToInitialDimensions(
    initialGridPosition = this.initialGridPosition,
    id = this.id,
  ) {
    if (!id) return;

    const node = editorStore.currentPage.getWidgetById(id);
    if (!node) return;
    editorStore.currentPage
      .getWidgetById(id)
      .setDimensions(initialGridPosition);
  }

  public static end(mousePos: Point): UndoableCommand | null {
    if (!this.id) return null;
    const initialDimensions = this.initialDimensions;
    const initialGridPosition = this.initialGridPosition;
    const affectedNodes = Array.from(this.collidingNodes);
    const undoData = affectedNodes.map((id) => ({
      id,
      ...this.orginalPositions[id],
    }));
    const id = this.id;
    const key = this.resizingKey;
    const direction = this.direction;
    const dims = this.calculateNewDimensions(
      mousePos,
      id,
      initialDimensions,
      direction,
      key,
    );
    editorStore.currentPage.setResizedWidgetId(null);
    if (!dims) return null;
    const command: UndoableCommand = {
      execute: () => {
        this._resize(id, dims!);
        const updates: UpdateNodesPayload = [
          editorStore.currentPage.getWidgetById(id).snapshot,
          ...undoData
            .filter((test) => test.id !== id)
            .map((k) => editorStore.currentPage.getWidgetById(k.id).snapshot),
        ];

        // return means data will be send to the server
        return {
          event: SOCKET_EVENTS_REQUEST.UPDATE_NODE,
          data: { updates },
        };
      },
      undo: () => {
        const updates: UpdateNodesPayload = [];
        this.returnToInitialDimensions(initialGridPosition, id);
        undoData.forEach((data) => {
          editorStore.currentPage.getWidgetById(data.id).setDimensions(data);
          updates.push(editorStore.currentPage.getWidgetById(data.id).snapshot);
        });
        updates.push(editorStore.currentPage.getWidgetById(id).snapshot);
        return {
          event: SOCKET_EVENTS_REQUEST.UPDATE_NODE,
          data: { updates },
        };
      },
    };
    this.cleanUp();
    return command;
  }

  static cancel(): Command | null {
    if (!this.id) return null;
    return {
      execute: () => {
        this.returnToOriginalPosition();
        this.returnToInitialDimensions();
        this.cleanUp();
      },
    };
  }

  private static _resize(
    id: string,
    dimensions: Partial<{
      x: number;
      y: number;
      width: number;
      height: number;
      rowsCount: number;
      columnsCount: number;
    }>,
  ) {
    const collidedNodes = [];
    const node = editorStore.currentPage.getWidgetById(id);
    if (!node) return [];

    let dims = {
      col: dimensions.x ?? node.col,
      row: dimensions.y ?? node.row,
      columnsCount: dimensions.columnsCount ?? node.columnsCount,
      rowsCount: dimensions.rowsCount ?? node.rowsCount,
    };

    dims = handleParentCollisions(
      dims,
      node.parent.pixelDimensions,
      editorStore.currentPage.getWidgetById(id).gridSize,
      false,
    );

    const orgCoords = editorStore.currentPage.moveWidgetIntoGrid(id, dims);
    collidedNodes.push(...Object.keys(orgCoords));
    return collidedNodes;
  }
  private static throttledMove = throttle(ResizeAction._move, 30);
}

export default ResizeAction;
