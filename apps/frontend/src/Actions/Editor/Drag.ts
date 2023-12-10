import store, { convertGridToPixel } from '@/store';
import { Command, UndoableCommand } from '../types';
import { nanoid } from 'nanoid';
import { Point } from '@/types';
import { EDITOR_CONSTANTS } from '@/lib/Editor/constants';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { normalize } from '@/lib/Editor/utils';
import { WebloomNode } from '@/lib/Editor/interface';
import { getNewWidgetName } from '@/store/widgetName';

const {
  moveNodeIntoGrid,
  moveNode,
  getGridSize,
  getBoundingRect,
  setShadowElement,
  addNode,
  removeNode,
  setDraggedNode,
  setDimensions,
  getPixelDimensions,
  getDropCoordinates,
} = store.getState();

class DragAction {
  private static threshold = 5;
  private static isNew = false;
  private static newType: string;
  private static id: string | null = null;
  private static readonly previewId = EDITOR_CONSTANTS.PREVIEW_NODE_ID;
  private static oldParent: string;
  private static currentParent: string;
  private static movedToNewParent = false;
  private static touchedRoot = false;
  private static startPosition: Point;
  private static gridStartPosition: Point;
  private static delta: Point;
  private static initialDelta: Point;
  private static mouseStartPosition: Point;
  private static mouseCurrentPosition: Point;
  private static moved = false;
  private static counter = 0;

  private static _start(args: {
    new?: {
      type: string;
      parent: string;
      startPosition: Point;
      initialDelta: Point;
    };
    id: string;
    mouseStartPosition: Point;
  }) {
    this.isNew = !!args.new;
    this.mouseStartPosition = args.mouseStartPosition;
    if (this.isNew) {
      this.initialDelta = args.new!.initialDelta;
      this.id = nanoid();
      const parent = store.getState().tree[args.new!.parent];
      const colWidth = parent.columnWidth;
      const rowHeight = EDITOR_CONSTANTS.ROW_HEIGHT;
      this.startPosition = {
        x: args.new!.startPosition.x * colWidth!,
        y: args.new!.startPosition.y * rowHeight,
      };
      this.gridStartPosition = args.new!.startPosition;
      this.newType = args.new!.type;
      const widget = WebloomWidgets[this.newType as WidgetTypes];
      const node: WebloomNode = {
        id: this.previewId,
        name: this.previewId,
        nodes: [],
        //todo change this to be the parent
        parent: args.new!.parent,
        dom: null,
        isCanvas: widget.config.isCanvas,
        col: args.new!.startPosition.x,
        row: args.new!.startPosition.y,
        columnsCount: widget.config.layoutConfig.colsCount,
        rowsCount: widget.config.layoutConfig.rowsCount,
        props: widget.defaultProps,
        type: this.newType as WidgetTypes,
      };
      addNode(node, args.new!.parent);
    } else {
      this.id = args.id;
      const draggedNode = store.getState().tree[this.id!];
      const node = { ...draggedNode, id: this.previewId, name: this.previewId };
      addNode(node, draggedNode.parent);
      const nodeBoundingRect = getBoundingRect(this.id!);
      this.oldParent = draggedNode.parent;
      this.startPosition = {
        x: nodeBoundingRect.left,
        y: nodeBoundingRect.top,
      };
      this.gridStartPosition = { x: draggedNode.col, y: draggedNode.row };
    }
    this.oldParent ||= EDITOR_CONSTANTS.ROOT_NODE_ID;
    const dims = getPixelDimensions(this.previewId);
    setShadowElement(dims);
    setDraggedNode(this.id!);
  }
  public static start(
    ...args: Parameters<typeof DragAction._start>
  ): Command | null {
    return {
      execute: () => {
        this._start(...args);
      },
    };
  }

  private static _move(
    mouseCurrentPosition: Point,
    delta: Point,
    overId: string | undefined,
  ) {
    if (!this.id) return;
    if (!overId) return;
    if (overId === EDITOR_CONSTANTS.ROOT_NODE_ID) {
      this.touchedRoot = true;
    }
    if (this.isNew) {
      delta.x -= this.initialDelta.x;
      delta.y -= this.initialDelta.y;
    }
    // The Grid col and row of the root is like the source of truth for the grid size
    this.mouseCurrentPosition = {
      x: this.mouseStartPosition.x + delta.x,
      y: this.mouseStartPosition.y + delta.y,
    };

    this.delta = delta;
    if (
      this.mouseStartPosition.x !== this.mouseCurrentPosition.x ||
      this.mouseStartPosition.y !== this.mouseCurrentPosition.y
    ) {
      this.moved = true;
    }
    if (!this.moved) return;
    if (overId === this.id) {
      overId = store.getState().tree[overId].parent!;
    }
    const node = store.getState().tree[this.previewId];
    const over = store.getState().tree[overId];
    let newParent: string = overId;
    if (!over.isCanvas) {
      newParent = over.parent;
    }
    if (newParent !== this.previewId && node.parent !== newParent) {
      this.movedToNewParent = true;
      this.currentParent = newParent;
      moveNode(this.previewId, newParent);
    }

    //Shadow element
    const newShadow = this.getDropCoordinates(
      delta,
      this.previewId!,
      overId === this.previewId! ? EDITOR_CONSTANTS.ROOT_NODE_ID : overId,
    );
    if (newParent === EDITOR_CONSTANTS.ROOT_NODE_ID) {
      const rootPixelDimensions = getPixelDimensions(
        EDITOR_CONSTANTS.ROOT_NODE_ID,
      );
      if (newShadow.y + newShadow.height >= rootPixelDimensions.height) {
        newShadow.y = rootPixelDimensions.height - newShadow.height;
      }
      if (newShadow.y < 0) {
        console.log('here 2');

        newShadow.y = 0;
      }
    }
    setShadowElement(newShadow);
  }
  public static move(...args: Parameters<typeof DragAction._move>): Command {
    return {
      execute: () => {
        this._move(...args);
      },
    };
  }
  public static end(
    ...args: Parameters<typeof DragAction._end>
  ): UndoableCommand | null {
    if (!this.moved) {
      removeNode(this.previewId!, false);
      this.cleanUp();
      return null;
    }
    return this._end(...args);
  }
  public static _end(overId: string | null): UndoableCommand | null {
    if (overId === null) {
      if (this.touchedRoot) {
        overId = EDITOR_CONSTANTS.ROOT_NODE_ID;
      } else {
        this.cleanUp();
        return null;
      }
    }
    const isNew = this.isNew;
    const delta = this.delta;
    const newNode = store.getState().tree[this.previewId!];
    const [gridrow, gridcol] = getGridSize(this.previewId!);
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };

    const endPosition = getDropCoordinates(
      this.startPosition,
      normalizedDelta,
      this.previewId!,
      overId,
      false,
    );
    const oldParent = this.oldParent;
    const startPosition = this.gridStartPosition;
    const movedToNewParent = this.movedToNewParent;
    const id = this.id!;
    let undoData: ReturnType<typeof moveNodeIntoGrid>;
    let command: UndoableCommand;
    removeNode(this.previewId, false);
    if (isNew) {
      newNode.id = id;
      newNode.name = getNewWidgetName(newNode.type);
      command = {
        execute: () => {
          addNode(newNode, newNode.parent!);
          undoData = moveNodeIntoGrid(id, endPosition);
          // return data means this data should be sent to the server
          const affectedNodes = Object.keys(undoData)
            .filter((test) => test !== id)
            .map((k) => store.getState().tree[k]);
          return {
            event: 'insert' as const,
            data: {
              node: store.getState().tree[id],
              sideEffects: affectedNodes,
            },
          };
        },
        undo: () => {
          store.getState().setSelectedNodeIds((ids) => {
            const newIds = new Set(ids);
            newIds.delete(id);
            return newIds;
          });
          removeNode(id);
          Object.entries(undoData).forEach(([id, coords]) => {
            setDimensions(id, coords);
          });
        },
      };
    } else {
      command = {
        execute: () => {
          if (movedToNewParent) {
            moveNode(id, newNode.parent);
          }
          undoData = moveNodeIntoGrid(id, endPosition);
          const tree = store.getState().tree;
          const remoteData = [
            tree[id],
            ...Object.keys(undoData)
              .filter((test) => test !== id)
              .map((k) => tree[k]),
          ];
          return {
            event: 'update',
            data: remoteData,
          };
        },
        undo: () => {
          Object.entries(undoData).forEach(([id, coords]) => {
            setDimensions(id, coords);
          });
          if (movedToNewParent) {
            moveNode(id, oldParent);
          }
          setDimensions(
            id,
            {
              col: startPosition.x,
              row: startPosition.y,
            }!,
          );
        },
      };
    }
    this.cleanUp();
    return command;
  }

  private static getDropCoordinates(delta: Point, id: string, overId: string) {
    const node = store.getState().tree[id];
    const grid = getGridSize(id);
    const parentPixelDimensions = getPixelDimensions(node.parent);
    return convertGridToPixel(
      getDropCoordinates(this.startPosition, delta, id, overId, true),
      grid,
      parentPixelDimensions,
    );
  }

  private static cleanUp() {
    this.isNew = false;
    this.initialDelta = { x: 0, y: 0 };
    this.id = null;
    this.touchedRoot = false;
    this.startPosition = { x: 0, y: 0 };
    this.delta = { x: 0, y: 0 };
    this.mouseStartPosition = { x: 0, y: 0 };
    this.mouseCurrentPosition = { x: 0, y: 0 };
    this.moved = false;
    this.movedToNewParent = false;
    this.counter = 0;
    setDraggedNode(null);
    setShadowElement(null);
  }
  public static cancel(): Command {
    return {
      execute: () => {
        this.cleanUp();
      },
    };
  }
}

export default DragAction;
