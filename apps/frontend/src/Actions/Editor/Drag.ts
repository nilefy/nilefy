import store, { WebloomNode } from '@/store';
import { Command, UndoableCommand } from '../types';
import { NUMBER_OF_COLUMNS, ROOT_NODE_ID, ROW_HEIGHT } from '@/lib/constants';
import { nanoid } from 'nanoid';
import { normalize } from '@/lib/utils';
import { WebloomComponents } from '@/components/Editor/WebloomComponents';
import { Point } from '@/types';
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
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
  getDimensions,
} = store.getState();
class DragAction {
  private static threshold = 5;
  private static isNew = false;
  private static newType: string;
  private static id: string | null = null;
  private static oldParent: string;
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
    this.id = args.id;
    if (this.isNew) {
      this.initialDelta = args.new!.initialDelta;
      const parent = store.getState().tree[args.new!.parent];
      const colWidth = parent.columnWidth;
      const rowHeight = ROW_HEIGHT;
      this.startPosition = {
        x: args.new!.startPosition.x * colWidth!,
        y: args.new!.startPosition.y * rowHeight,
      };
      this.gridStartPosition = args.new!.startPosition;
      this.newType = args.new!.type;
      const node: WebloomNode = {
        id: 'new',
        name: 'new',
        type: WebloomComponents[this.newType].component,
        nodes: [],
        //todo change this to be the parent
        parent: args.new!.parent,
        dom: null,
        props: {
          color: getRandomColor(),
          text: this.counter++,
        },
        isCanvas: WebloomComponents[this.newType].isCanvas,
        x: args.new!.startPosition.x,
        y: args.new!.startPosition.y,
        columnsCount: 4,
        rowsCount: 8,
      };
      addNode(node, args.new!.parent);
    } else {
      const node = store.getState().tree[this.id!];
      const nodeBoundingRect = getBoundingRect(this.id!);

      this.oldParent = store.getState().tree[this.id!].parent!;
      this.startPosition = {
        x: nodeBoundingRect.left,
        y: nodeBoundingRect.top,
      };
      this.gridStartPosition = { x: node.x, y: node.y };
    }
    this.oldParent ||= ROOT_NODE_ID;
    setDraggedNode(this.isNew ? 'new' : this.id!);
    const dims = getDimensions(this.id!);
    setShadowElement({
      x: dims.x,
      y: dims.y,
      width: dims.width,
      height: dims.height,
    });
  }
  public static start(...args: Parameters<typeof DragAction._start>): Command {
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
    if (overId === ROOT_NODE_ID) {
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

    const node = store.getState().tree[this.id!];
    const over = store.getState().tree[overId];
    if (overId !== this.id && node.parent !== overId && over.isCanvas) {
      this.movedToNewParent = true;
      moveNode(this.id, overId);
    }

    //Shadow element
    const newShadow = this.getElementShadow(
      delta,
      mouseCurrentPosition,
      this.id!,
      overId === this.id! ? ROOT_NODE_ID : overId,
    );
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
      this.cleanUp();
      return null;
    }
    return this._end(...args);
  }
  public static _end(overId: string | null): UndoableCommand | null {
    if (overId === null) {
      if (this.touchedRoot) {
        overId = ROOT_NODE_ID;
      } else {
        this.cleanUp();
        return null;
      }
    }
    const isNew = this.isNew;
    const delta = this.delta;
    const el = store.getState().tree[this.id!];
    const [gridrow, gridcol] = getGridSize(this.id!);
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };
    const newPosition = {
      x: this.startPosition.x + normalizedDelta.x,
      y: this.startPosition.y + normalizedDelta.y,
    }; // -> this is the absolute position in pixels (normalized to the grid)
    const parentBoundingRect = getBoundingRect(el.parent!);
    const position = {
      x: newPosition.x - parentBoundingRect.left,
      y: newPosition.y - parentBoundingRect.top,
    }; // -> this is the position in pixels relative to the parent (normalized to the grid)
    // Transform the postion to grid units (columns and rows)
    const endPosition = {
      x: Math.round(position.x / gridcol),
      y: Math.round(position.y / gridrow),
    }; // -> this is the position in grid units (columns and rows)
    const oldParent = this.oldParent;
    const startPosition = this.gridStartPosition;
    const movedToNewParent = this.movedToNewParent;
    const id = this.id!;
    let undoData: ReturnType<typeof moveNodeIntoGrid>;
    let command: UndoableCommand;
    if (isNew) {
      const newNode = store.getState().tree['new'];
      const id = nanoid();
      newNode.id = id;
      removeNode('new');
      command = {
        execute: () => {
          addNode(newNode, newNode.parent!);
          undoData = moveNodeIntoGrid(id, endPosition);
        },
        undo: () => {
          removeNode(id);
          Object.entries(undoData.changedNodesOriginalCoords).forEach(
            ([id, coords]) => {
              setDimensions(id, {
                x: coords.x,
                y: coords.y,
              });
            },
          );
        },
      };
    } else {
      command = {
        execute: () => {
          if (movedToNewParent) {
            moveNode(id, el.parent);
          }
          undoData = moveNodeIntoGrid(id, endPosition);
        },
        undo: () => {
          Object.entries(undoData.changedNodesOriginalCoords).forEach(
            ([id, coords]) => {
              setDimensions(id, {
                x: coords.x,
                y: coords.y,
              });
            },
          );
          if (movedToNewParent) {
            moveNode(id, oldParent);
          }
          setDimensions(id, startPosition!);
        },
      };
    }
    this.cleanUp();
    return command;
  }

  private static getElementShadow(
    delta: Point,
    mousePos: Point,
    id: string,
    overId: string,
  ) {
    const tree = store.getState().tree;
    const el = tree[id];
    const [gridrow, gridcol] = getGridSize(el.id);
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };
    const newPosition = {
      x: this.startPosition.x + normalizedDelta.x,
      y: this.startPosition.y + normalizedDelta.y,
    }; // -> this is the absolute position in pixels (normalized to the grid)
    const parent = tree[el.parent!];
    const parentBoundingRect = getBoundingRect(el.parent!);
    const position = {
      x: newPosition.x - parentBoundingRect.left,
      y: newPosition.y - parentBoundingRect.top,
    }; // -> this is the position in pixels relative to the parent (normalized to the grid)
    // Transform the postion to grid units (columns and rows)
    const gridPosition = {
      x: Math.round(position.x / gridcol),
      y: Math.round(position.y / gridrow),
    }; // -> this is the position in grid units (columns and rows)
    let top = gridPosition.y;
    let left = gridPosition.x;
    const oldLeft = left * gridcol;
    let colCount = el.columnsCount;
    let rowCount = el.rowsCount;
    const width = el.columnsCount * gridcol;
    const height = el.rowsCount * gridrow;
    for (const sibling of parent.nodes) {
      if (sibling === id) continue;
      if (sibling === overId) continue;
      const otherNode = tree[sibling];
      const otherBoundingRect = getBoundingRect(sibling);
      const otherBottom = otherNode.y + otherNode.rowsCount;
      const otherTop = otherNode.y;
      const otherLeft = otherNode.x;
      const otherRight = otherNode.x + otherNode.columnsCount;
      if (top < otherBottom && top >= otherTop) {
        if (
          mousePos.x > otherBoundingRect.left &&
          mousePos.x < otherBoundingRect.right &&
          mousePos.y >= otherBoundingRect.bottom
        ) {
          // mouse under other element and between its left and right
          top = otherBottom;
        } else if (left < otherLeft && left + colCount > otherLeft) {
          colCount = Math.min(colCount, otherLeft - left);
          if (colCount < 2) {
            left = otherLeft - 2;
            colCount = 2;
          }
        } else if (left >= otherLeft && left < otherRight) {
          const temp = left;
          left = otherRight;
          colCount += temp - left;
          if (colCount < 2) {
            colCount = 2;
          }
        }
      }
    }
    newPosition.x = left * gridcol + parentBoundingRect.left;
    newPosition.y = top * gridrow + parentBoundingRect.top;
    //left < parentLeft
    if (newPosition.x < parentBoundingRect.left) {
      colCount = (newPosition.x + width - parentBoundingRect.left) / gridcol;
      left = 0;
      if (colCount < 1) {
        colCount = 1;
      }
    }
    //right >= parentRight
    if (newPosition.x + width > parentBoundingRect.right) {
      // colCount = Math.min(colCount, parentRight - left);
      const diff = parentBoundingRect.right - newPosition.x;
      const newColCount = Math.floor(diff / gridcol);
      colCount = Math.min(colCount, newColCount);
      if (colCount < 1) {
        colCount = 1;
      }
    }

    //top < parentTop
    if (newPosition.y < parentBoundingRect.top) {
      top = 0;
      rowCount = (newPosition.y + height - parentBoundingRect.top) / gridrow;
    }
    //bottom >= parentBottom
    if (newPosition.y + height > parentBoundingRect.bottom) {
      const diff = parentBoundingRect.bottom - newPosition.y;
      const newRowCount = Math.floor(diff / gridrow);
      rowCount = Math.min(rowCount, newRowCount);
      if (rowCount < 1) {
        rowCount = 1;
      }
    }
    colCount = Math.min(NUMBER_OF_COLUMNS, colCount);
    rowCount = Math.min(parent.rowsCount, rowCount);
    const overEl = tree[overId];
    const newWidth = colCount * gridcol;
    const newHeight = rowCount * gridrow;
    top = Math.round(top * gridrow) + parentBoundingRect.top;
    left = Math.round(left * gridcol) + parentBoundingRect.left;

    const shadowDimensions = {
      x: left,
      y: top,
      width: newWidth,
      height: newHeight,
    };

    //todo change this when droppable areas have padding around them
    if (overEl && !overEl.isCanvas) {
      const overBoundingRect = getBoundingRect(overId as string);
      shadowDimensions.x = oldLeft;
      if (
        mousePos.y <=
        overBoundingRect.top +
          (overBoundingRect.bottom - overBoundingRect.top) / 2 -
          this.threshold
      ) {
        shadowDimensions.y = overBoundingRect.top - 10;
        shadowDimensions.height = 10;
      } else {
        shadowDimensions.y = overBoundingRect.bottom;
      }
    }
    return shadowDimensions;
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
