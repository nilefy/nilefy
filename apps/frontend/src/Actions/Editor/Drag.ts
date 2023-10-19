import store, { WebloomNode } from '@/store';
import { Command, UndoableCommand } from '../types';
import { ROOT_NODE_ID } from '@/lib/constants';
import { nanoid } from 'nanoid';
import { normalize } from '@/lib/utils';
import { WebloomComponents } from '@/components/Editor/WebloomComponents';
type Point = {
  x: number;
  y: number;
};
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
  private static overId: string;
  private static startGridPosition: Point;
  private static delta: Point;
  private static mouseStartPosition: Point;
  private static mouseCurrentPosition: Point;
  private static moved = false;
  private static _start(args: {
    new?: {
      type: string;
      parent: string;
      startPosition: Point;
    };
    id: string;
    mouseStartPosition: Point;
  }) {
    this.isNew = !!args.new;
    this.mouseStartPosition = args.mouseStartPosition;
    this.id = args.id;
    if (this.isNew) {
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
          className: 'bg-red-500',
        },
        height: 0,
        width: 0,
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
    overId: string | undefined,
  ) {
    if (!overId) return;
    const [gridrow, gridcol] = getGridSize(this.id!);
    this.mouseCurrentPosition = mouseCurrentPosition;
    const delta = {
      x:
        normalize(
          this.mouseCurrentPosition.x - this.mouseStartPosition.x,
          gridcol,
        ) / gridcol,
      y:
        normalize(
          this.mouseCurrentPosition.y - this.mouseStartPosition.y,
          gridrow,
        ) / gridrow,
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
      x: this.startGridPosition.x + delta.x,
      y: this.startGridPosition.y + delta.y,
    };
    //Shadow element
    const newShadow = this.getElementShadow(
      currentGridPosition,
      mouseCurrentPosition,
      this.id!,
      overId,
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
  public static _end(overId: string): UndoableCommand {
    setDraggedNode(null);
    setShadowElement(null);
    this.moved = false;
    const isNew = this.isNew;
    this.isNew = false;
    const delta = { ...this.delta };
    const endPosition = {
      x: this.startGridPosition.x + delta.x,
      y: this.startGridPosition.y + delta.y,
    };
    if (overId !== ROOT_NODE_ID && overId !== this.id) {
      const overNode = store.getState().tree[overId];
      const overNodeBoundingRect = getBoundingRect(overId);
      const overNodeTop = overNode.y;
      const overNodeBottom = overNode.y + overNode.rowsCount;
      if (
        this.mouseCurrentPosition.y <=
        overNodeBoundingRect.top +
          (overNodeBoundingRect.bottom - overNodeBoundingRect.top) / 2 -
          //todo: replace threshold with a proper value depending on the current gridsize
          this.threshold
      ) {
        endPosition.y = overNodeTop - 1;
      } else {
        endPosition.y = overNodeBottom;
      }
    }
    const id = this.id!;
    let undoData: ReturnType<typeof moveNodeIntoGrid>;

    if (isNew) {
      const newNode = store.getState().tree['new'];
      const id = nanoid();
      newNode.id = id;
      removeNode('new');
      return {
        execute: () => {
          addNode(newNode, newNode.parent!);
          undoData = moveNodeIntoGrid(id, endPosition);
        },
        undo: () => {
          removeNode(id);
          undoData.changedNodesOriginalCoords.forEach((node) => {
            setDimensions(node.id, {
              x: node.x,
              y: node.y,
            });
          });
        },
      };
    }

    return {
      execute: () => {
        undoData = moveNodeIntoGrid(id, endPosition);
      },
      undo: () => {
        undoData.changedNodesOriginalCoords.forEach((node) => {
          setDimensions(node.id, {
            x: node.x,
            y: node.y,
          });
        });
        setDimensions(id, undoData.firstNodeOriginalDimensions);
      },
    };
  }
  private static getElementShadow(
    position: Point,
    mousePos: Point,
    id: string,
    overId: string,
  ) {
    const tree = store.getState().tree;
    const [gridrow, gridcol] = getGridSize(id);
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
      const otherBottom = otherNode.y + otherNode.rowsCount;
      const otherTop = otherNode.y;
      const otherLeft = otherNode.x;
      const otherRight = otherNode.x + otherNode.columnsCount;
      if (top < otherBottom && top >= otherTop) {
        if (left < otherLeft && left + colCount > otherLeft) {
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
    const newWidth = colCount * gridcol;
    top = Math.round(top * gridrow);
    left = Math.round(left * gridcol);
    const shadowDimensions = {
      x: left,
      y: top,
      width,
      height,
    };
    const overEl = tree[overId];
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
}

export default DragAction;
