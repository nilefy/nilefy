import store, {
  WebloomNode,
  convertGridToPixel,
  convertPixelToGrid,
} from '@/store';
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
  getPixelDimensions,
  getDropCoordinates,
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
        col: args.new!.startPosition.x,
        row: args.new!.startPosition.y,
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
      this.gridStartPosition = { x: node.col, y: node.row };
    }
    this.oldParent ||= ROOT_NODE_ID;
    setDraggedNode(this.isNew ? 'new' : this.id!);
    const dims = getPixelDimensions(this.id!);
    setShadowElement(dims);
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
    let newParent: string = overId;
    if (!over.isCanvas) {
      newParent = over.parent;
    }
    if (newParent !== this.id && node.parent !== newParent) {
      this.movedToNewParent = true;
      moveNode(this.id, newParent);
    }
    //Shadow element
    const newShadow = this.getDropCoordinates(
      delta,
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

    const endPosition = getDropCoordinates(
      this.startPosition,
      normalizedDelta,
      this.id!,
      overId,
      false,
    );
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
              setDimensions(id, coords);
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
              setDimensions(id, coords);
            },
          );
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
