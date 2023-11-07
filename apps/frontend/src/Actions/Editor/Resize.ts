import store, { WebloomGridDimensions } from '@/store';
import { Command, UndoableCommand } from '../types';
import { ROOT_NODE_ID } from '@/lib/constants';
import { normalize } from '@/lib/utils';
import { Point } from '@/types';
type MainResizingKeys = 'top' | 'bottom' | 'left' | 'right';
type CornerResizingKeys =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
type ResizingKeys = MainResizingKeys | CornerResizingKeys;
const { moveNodeIntoGrid, getGridSize, setDimensions, resizeCanvas } =
  store.getState();
class ResizeAction {
  public static resizingKey: ResizingKeys | null = null;
  private static direction: MainResizingKeys[];
  private static orginalPositions: Record<string, Point> = {};
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

    const positionsSnapshot = Object.entries(store.getState().tree).reduce(
      (acc, node) => {
        if (node[0] === ROOT_NODE_ID) return acc;
        return {
          ...acc,
          [node[0]]: {
            x: node[1].col,
            y: node[1].row,
          },
        };
      },
      {},
    );
    this.orginalPositions = positionsSnapshot;
    this.initialGridPosition = store.getState().getGridDimensions(id);
    this.initialDimensions = dimensions;
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
    const root = store.getState().tree[ROOT_NODE_ID];
    if (!root.dom) return;

    const { width: initialWidth, height: initialHeight } = initialDimensions;
    const { x: initialLeft, y: initialTop } = initialDimensions;
    const initialRight = initialLeft + initialWidth;
    const initialBottom = initialTop + initialHeight;
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newLeft = initialLeft;
    let newTop = initialTop;

    let { x, y } = mousePosition;
    const rect = root.dom.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top; // -> so that we get the mousePos relative to the root element
    const node = store.getState().tree[id];

    const [gridRow, gridCol] = getGridSize(id);
    const minWidth = gridCol * 2;
    const minHeight = gridRow * 10;
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
    const parent = store.getState().getPixelDimensions(node.parent);
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
      if (pos.y === store.getState().tree[id].row) {
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
        this._move(...args);
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
      setDimensions(id, {
        col: pos.x,
        row: pos.y,
      });
    });
  }

  private static returnToInitialDimensions(
    initialGridPosition = this.initialGridPosition,
    id = this.id,
  ) {
    if (!id) return;

    const node = store.getState().tree[id];
    if (!node) return;
    if (node.isCanvas) {
      resizeCanvas(id, initialGridPosition);
      return;
    }
    setDimensions(id, initialGridPosition);
  }

  public static end(mousePos: Point): UndoableCommand | null {
    if (!this.id) return null;
    const initialDimensions = this.initialDimensions;
    const initialGridPosition = this.initialGridPosition;
    const affectedNodes = Array.from(this.collidingNodes);
    const undoData = affectedNodes.map((id) => ({
      id,
      x: this.orginalPositions[id].x,
      y: this.orginalPositions[id].y,
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
    if (!dims) return null;
    const command = {
      execute: () => {
        this._resize(id, dims!);
      },
      undo: () => {
        this.returnToInitialDimensions(initialGridPosition, id);
        undoData.forEach((data) => {
          setDimensions(data.id, {
            col: data.x,
            row: data.y,
          });
        });
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
    const tree = store.getState().tree;
    const node = tree[id];
    if (!node) return [];
    const orgCoords = moveNodeIntoGrid(id, {
      col: dimensions.x ?? node.col,
      row: dimensions.y ?? node.row,
      columnsCount: dimensions.columnsCount ?? node.columnsCount,
      rowsCount: dimensions.rowsCount ?? node.rowsCount,
    });
    collidedNodes.push(...Object.keys(orgCoords));
    return collidedNodes;
  }
}

export default ResizeAction;
