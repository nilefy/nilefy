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
  private static touchedRoot = false;
  private static startGridPosition: Point;
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
      this.startGridPosition = args.new!.startPosition;
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
        x: this.startGridPosition.x,
        y: this.startGridPosition.y,
        columnsCount: 4,
        rowsCount: 8,
      };
      addNode(node, args.new!.parent);
    } else {
      const node = store.getState().tree[this.id!];
      this.startGridPosition = { x: node.x, y: node.y };
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
    const [gridrow, gridcol] = getGridSize(this.id!);
    this.mouseCurrentPosition = mouseCurrentPosition;
    delta = {
      x: normalize(delta.x, gridcol) / gridcol,
      y: normalize(delta.y, gridrow) / gridrow,
    };

    this.delta = delta;
    if (
      this.mouseStartPosition.x !== this.mouseCurrentPosition.x ||
      this.mouseStartPosition.y !== this.mouseCurrentPosition.y
    ) {
      this.moved = true;
    }
    if (!this.moved) return;
    const currentGridPosition = {
      x: Math.min(this.startGridPosition.x + delta.x, NUMBER_OF_COLUMNS - 1),
      y: this.startGridPosition.y + delta.y,
    };
    const node = store.getState().tree[this.id!];
    const parent = store.getState().tree[node.parent!];
    const bottom = currentGridPosition.y + node.rowsCount;
    const parentBottom = parent.y + parent.rowsCount;

    if (bottom > parentBottom) {
      this.expandNodeVertically(parent.id!, bottom - parentBottom);
    }
    //Shadow element
    const newShadow = this.getElementShadow(
      currentGridPosition,
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
      x: Math.min(this.startGridPosition.x + delta.x, NUMBER_OF_COLUMNS - 1),
      y: this.startGridPosition.y + delta.y,
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
      rowsCount: node.rowsCount + amount,
    });
  }

  private static getElementShadow(
    position: Point,
    mousePos: Point,
    id: string,
    overId: string,
  ) {
    const tree = store.getState().tree;
    const [gridrow, gridcol] = getGridSize(ROOT_NODE_ID);
    const overGridCol = tree[overId].columnWidth;
    const el = tree[id];
    const parent = tree[el.parent!];
    let top = position.y;
    let left = position.x;
    const oldLeft = left * gridcol;
    let colCount = el.columnsCount;
    const right = left + el.columnsCount;
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
    const parentLeft = parent.x;
    const parentRight = parent.x + parent.columnsCount;
    if (right >= parentRight) {
      colCount = Math.min(colCount, parentRight - left);
      if (colCount < 1) {
        colCount = 1;
      }
    }
    if (left < parentLeft) {
      colCount = right - parentLeft;
      left = parentLeft;
      if (colCount < 1) {
        colCount = 1;
      }
    }
    const overEl = tree[overId];
    const newWidth = colCount * gridcol;
    top = Math.round(top * gridrow);
    left = Math.round(left * gridcol);
    if (overId !== ROOT_NODE_ID) {
      //todo
    }
    const shadowDimensions = {
      x: left,
      y: top,
      width,
      height,
    };
    if (overId === ROOT_NODE_ID || overId === id) {
      shadowDimensions.width = newWidth;
    } else if (overEl) {
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
    this.startGridPosition = { x: 0, y: 0 };
    this.delta = { x: 0, y: 0 };
    this.mouseStartPosition = { x: 0, y: 0 };
    this.mouseCurrentPosition = { x: 0, y: 0 };
    this.moved = false;
    this.counter = 0;
    setDraggedNode(null);
    setShadowElement(null);
  }
}

export default DragAction;
