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
} = store.getState();
class DragAction {
  private static threshold = 5;
  private static isNew = false;
  private static newType: string;
  private static id: string | null;
  private static overId: string | null;
  private static expansions: Record<string, number> = {};
  private static touchedRoot = false;
  private static startPosition: Point;
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
      const node = store.getState().getBoundingRect(this.id!);
      this.startPosition = { x: node.left, y: node.top };
    }
    setDraggedNode(this.isNew ? 'new' : this.id!);
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
    this.overId = overId;
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
    // const currentGridPosition = {
    //   x: Math.min(this.startPosition.x + delta.x, NUMBER_OF_COLUMNS - 1),
    //   y: this.startPosition.y + delta.y,
    // };

    const node = store.getState().tree[this.id!];
    const over = store.getState().tree[overId];
    let parent = node.parent || ROOT_NODE_ID;
    if (overId !== this.id && node.parent !== overId && over.isCanvas) {
      moveNode(this.id, overId);
      parent = overId;
    }
    const parentBoundingRect = getBoundingRect(parent);
    const [gridrow, gridcol] = getGridSize(this.id);
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };
    const newPosition = {
      x: this.startPosition.x + normalizedDelta.x,
      y: this.startPosition.y + normalizedDelta.y,
    }; // -> this is the absolute position in pixels (normalized to the grid)
    const bottom = newPosition.y + node.rowsCount * gridrow;
    if (bottom >= parentBoundingRect.bottom) {
      this.expandNodeVertically(parent, bottom - parentBoundingRect.bottom);
    } else if (this.canShrink()) {
      Object.entries(this.expansions).forEach(([id, amount]) => {
        if (id !== parent) {
          this.shrinkNodeVertically(id, amount);
        } else {
          this.shrinkNodeVertically(
            id,
            Math.min(parentBoundingRect.bottom - bottom, amount),
          );
        }
      });
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
    if (!this.moved) return null;
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
    const delta = { ...this.delta };
    const endPosition = {
      x: Math.min(this.startPosition.x + delta.x, NUMBER_OF_COLUMNS - 1),
      y: this.startPosition.y + delta.y,
    };
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
          setDimensions(id, undoData.firstNodeOriginalDimensions!);
        },
      };
    }
    this.cleanUp();
    return command;
  }
  private static expandNodeVertically(id: string, amount = 1) {
    const node = store.getState().tree[id];
    setDimensions(id, {
      rowsCount: node.rowsCount + Math.floor(amount / ROW_HEIGHT),
    });
    this.expansions[id] ||= 0;
    this.expansions[id] += amount;
  }

  private static shrinkNodeVertically(id: string, amount = 1) {
    const node = store.getState().tree[id];
    setDimensions(id, {
      rowsCount: node.rowsCount - Math.floor(amount / ROW_HEIGHT),
    });
    this.expansions[id] -= amount;
    if (this.expansions[id] === 0) {
      delete this.expansions[id];
    }
  }
  private static canShrink() {
    return Object.keys(this.expansions).length > 0;
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
          mousePos.y > otherBoundingRect.bottom
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
    //left < parentLeft
    if (newPosition.x < parentBoundingRect.left) {
      colCount = (newPosition.x + width - parentBoundingRect.left) / gridcol;
      left = 0;
      if (colCount < 1) {
        colCount = 1;
      }
    }
    //top < parentTop
    if (newPosition.y < parentBoundingRect.top) {
      top = 0;
      rowCount = (newPosition.y + height - parentBoundingRect.top) / gridrow;
    }
    const overEl = tree[overId];
    const newWidth = colCount * gridcol;
    const newHeight = rowCount * gridrow;
    top = Math.round(top * gridrow) + parentBoundingRect.top;
    left = Math.round(left * gridcol) + parentBoundingRect.left;
    if (overId !== ROOT_NODE_ID) {
      //todo
    }
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
    this.overId = null;
    this.touchedRoot = false;
    this.startPosition = { x: 0, y: 0 };
    this.delta = { x: 0, y: 0 };
    this.mouseStartPosition = { x: 0, y: 0 };
    this.mouseCurrentPosition = { x: 0, y: 0 };
    this.moved = false;
    this.counter = 0;
    this.expansions = {};
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
