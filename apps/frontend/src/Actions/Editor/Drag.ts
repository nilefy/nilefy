// import store, { convertGridToPixel } from '@/store';
import { editorStore } from '@/lib/Editor/Models';
import { Command, UndoableCommand } from '../types';
import { Point } from '@/types';
import { EDITOR_CONSTANTS } from '@webloom/constants';

import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { convertGridToPixel, normalize } from '@/lib/Editor/utils';
import { getNewWidgetName } from '@/store/widgetName';
import { WebloomPage } from '@/lib/Editor/Models/page';

type AddWidgetPayload = Parameters<
  InstanceType<typeof WebloomPage>['addWidget']
>[0];

// const {
//   moveNodeIntoGrid,
//   moveNode,
//   getGridSize,
//   getBoundingRect,
//   setShadowElement,
//   addNode,
//   removeNode,
//   setDraggedNode,
//   setDimensions,
//   getPixelDimensions,
//   getDropCoordinates,
// } = store.getState();

class DragAction {
  private static isNew = false;
  private static newType: string;
  private static id: string | null = null;
  private static readonly previewId = EDITOR_CONSTANTS.PREVIEW_NODE_ID;
  private static oldParentId: string;
  private static movedToNewParent = false;
  private static touchedRoot = false;
  private static startPosition: Point;
  private static gridStartPosition: Point;
  private static delta: Point;
  private static initialDelta: Point;
  private static mouseStartPosition: Point;
  private static mouseCurrentPosition: Point;
  private static moved = false;

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
      this.id = getNewWidgetName(args.new!.type as WidgetTypes);
      const parent = editorStore.currentPage.getWidgetById(args.new!.parent);
      // const parent = store.getState().tree[args.new!.parent];
      const colWidth = parent.columnWidth;
      const rowHeight = EDITOR_CONSTANTS.ROW_HEIGHT;
      this.startPosition = {
        x: args.new!.startPosition.x * colWidth!,
        y: args.new!.startPosition.y * rowHeight,
      };
      this.gridStartPosition = args.new!.startPosition;
      this.newType = args.new!.type;
      const widget = WebloomWidgets[this.newType as WidgetTypes];
      const node: AddWidgetPayload = {
        id: this.previewId,
        nodes: [],
        // dependancies: [],
        //todo change this to be the parent
        parentId: args.new!.parent,
        // isCanvas: widget.config.isCanvas,
        col: args.new!.startPosition.x,
        row: args.new!.startPosition.y,
        columnsCount: widget.config.layoutConfig.colsCount,
        rowsCount: widget.config.layoutConfig.rowsCount,
        props: widget.defaultProps,
        type: this.newType as WidgetTypes,
      };
      editorStore.currentPage.addWidget(node);
    } else {
      this.id = args.id;
      const draggedNode = editorStore.currentPage.getWidgetById(this.id);
      const snapshot = draggedNode.snapshot;
      // const draggedNode = store.getState().tree[this.id!];
      const node: AddWidgetPayload = {
        ...snapshot,
        id: this.previewId,
      };
      editorStore.currentPage.addWidget(node);
      // addNode(node, draggedNode.parent);
      const nodeBoundingRect = draggedNode.boundingRect;
      // const nodeBoundingRect = getBoundingRect(this.id!);
      this.oldParentId = draggedNode.parentId;
      this.startPosition = {
        x: nodeBoundingRect.left,
        y: nodeBoundingRect.top,
      };
      this.gridStartPosition = { x: draggedNode.col, y: draggedNode.row };
    }
    this.oldParentId ||= EDITOR_CONSTANTS.ROOT_NODE_ID;
    const dims = editorStore.currentPage.getWidgetById(
      this.previewId,
    ).pixelDimensions;
    // const dims =  getPixelDimensions(this.previewId);
    editorStore.currentPage.setShadowElement(dims);
    // setShadowElement(dims);
    editorStore.currentPage.setDraggedWidgetId(this.id!);
    // setDraggedNode(this.id!);
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
      overId = editorStore.currentPage.getWidgetById(overId).parentId;
      // overId = store.getState().tree[overId].parent!;
    }
    const node = editorStore.currentPage.getWidgetById(this.previewId);
    const over = editorStore.currentPage.getWidgetById(overId);
    // const node = store.getState().tree[this.previewId];
    // const over = store.getState().tree[overId];
    let newParentId: string = overId;
    if (!over.isCanvas) {
      newParentId = over.parentId;
    }
    if (newParentId !== this.previewId && node.parentId !== newParentId) {
      this.movedToNewParent = true;
      editorStore.currentPage.moveWidget(this.previewId, newParentId);
    }

    //Shadow element
    const newShadow = this.getDropCoordinates(
      delta,
      this.previewId!,
      overId === this.previewId! ? EDITOR_CONSTANTS.ROOT_NODE_ID : overId,
    );
    if (newParentId === EDITOR_CONSTANTS.ROOT_NODE_ID) {
      const rootPixelDimensions =
        editorStore.currentPage.rootWidget.pixelDimensions;
      // const rootPixelDimensions = getPixelDimensions(
      //   EDITOR_CONSTANTS.ROOT_NODE_ID,
      // );
      if (newShadow.y + newShadow.height >= rootPixelDimensions.height) {
        newShadow.y = rootPixelDimensions.height - newShadow.height;
      }
      if (newShadow.y < 0) {
        newShadow.y = 0;
      }
    }
    editorStore.currentPage.setShadowElement(newShadow);
    // setShadowElement(newShadow);
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
      editorStore.currentPage.removeWidget(this.previewId!, false);
      // removeNode(this.previewId!, false);
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
    const newNode = editorStore.currentPage.getWidgetById(this.previewId);
    const [gridrow, gridcol] = newNode.gridSize;
    // const newNode = store.getState().tree[this.previewId!];
    // const [gridrow, gridcol] = getGridSize(this.previewId!);
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };

    const endPosition = newNode.getDropCoordinates(
      this.startPosition,
      normalizedDelta,
      this.previewId!,
      overId,
      this.mouseCurrentPosition,
      false,
    );
    // const endPosition = getDropCoordinates(
    //   this.startPosition,
    //   normalizedDelta,
    //   this.previewId!,
    //   overId,
    //   false,
    // );
    const oldParentId = this.oldParentId;
    const startPosition = this.gridStartPosition;
    const movedToNewParent = this.movedToNewParent;
    const id = this.id!;
    let undoData: ReturnType<
      InstanceType<typeof WebloomPage>['moveWidgetIntoGrid']
    >;
    let command: UndoableCommand;
    editorStore.currentPage.removeWidget(this.previewId, false);
    // removeNode(this.previewId, false);
    if (isNew) {
      const snapshot = newNode.snapshot;
      const nodePayload: AddWidgetPayload = {
        ...snapshot,
        id: id,
      };
      command = {
        execute: () => {
          editorStore.currentPage.addWidget(nodePayload);
          // addNode(newNode, newNode.parent!);
          undoData = editorStore.currentPage.moveWidgetIntoGrid(
            id,
            endPosition,
          );
          // undoData = moveNodeIntoGrid(id, endPosition);

          // return data means this data should be sent to the server
          const affectedNodes = Object.keys(undoData)
            .filter((test) => test !== id)
            .map((k) => editorStore.currentPage.getWidgetById(k).snapshot);
          // const affectedNodes = Object.keys(undoData)
          //   .filter((test) => test !== id)
          //   .map((k) => store.getState().tree[k]);
          return {
            event: 'insert' as const,
            data: {
              node: editorStore.currentPage.getWidgetById(id).snapshot,
              // node: store.getState().tree[id],
              sideEffects: affectedNodes,
            },
          };
        },
        undo: () => {
          editorStore.currentPage.setSelectedNodeIds((ids) => {
            const newIds = new Set(ids);
            newIds.delete(id);
            return newIds;
          });
          // store.getState().setSelectedNodeIds((ids) => {
          //   const newIds = new Set(ids);
          //   newIds.delete(id);
          //   return newIds;
          // });
          editorStore.currentPage.removeWidget(id);
          // removeNode(id);
          Object.entries(undoData).forEach(([id, coords]) => {
            editorStore.currentPage.getWidgetById(id).setDimensions(coords);
          });
          // Object.entries(undoData).forEach(([id, coords]) => {
          //   setDimensions(id, coords);
          // });
        },
      };
    } else {
      command = {
        execute: () => {
          if (movedToNewParent) {
            editorStore.currentPage.moveWidget(id, newNode.parentId);
            // moveNode(id, newNode.parent);
          }
          undoData = editorStore.currentPage.moveWidgetIntoGrid(
            id,
            endPosition,
          );
          // undoData = moveNodeIntoGrid(id, endPosition);
          const remoteData = [
            editorStore.currentPage.getWidgetById(id).snapshot,
            ...Object.keys(undoData)
              .filter((test) => test !== id)
              .map((k) => editorStore.currentPage.getWidgetById(k).snapshot),
          ];
          return {
            event: 'update',
            data: remoteData,
          };
        },
        undo: () => {
          Object.entries(undoData).forEach(([id, coords]) => {
            editorStore.currentPage.getWidgetById(id).setDimensions(coords);
          });
          if (movedToNewParent) {
            editorStore.currentPage.moveWidget(id, oldParentId);
          }
          editorStore.currentPage.getWidgetById(id).setDimensions(
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
    const node = editorStore.currentPage.getWidgetById(id);
    const grid = node.gridSize;
    // const node = store.getState().tree[id];
    // const grid = getGridSize(id);
    const parentPixelDimensions = node.parent.pixelDimensions;
    // const parentPixelDimensions = getPixelDimensions(node.parent);
    return convertGridToPixel(
      node.getDropCoordinates(
        this.startPosition,
        delta,
        overId,
        this.id!,
        this.mouseCurrentPosition,
        true,
      ),
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
    editorStore.currentPage.setDraggedWidgetId(null);
    editorStore.currentPage.setShadowElement(null);
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
