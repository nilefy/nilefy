import store from '@/store';
import { Command, UndoableCommand } from '../types';
import { ROOT_NODE_ID } from '@/lib/constants';
import { checkOverlap, normalize } from '@/lib/utils';
import { Point } from '@/types';
type MainResizingKeys = 'top' | 'bottom' | 'left' | 'right';
type CornerResizingKeys =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
type ResizingKeys = MainResizingKeys | CornerResizingKeys;
const { moveNodeIntoGrid, getGridSize, setDimensions } = store.getState();
class ResizeAction {
  public static resizingKey: ResizingKeys | null = null;
  private static direction: MainResizingKeys[];
  private static orginalPositions: Record<string, Point> = {};
  private static collidingNodes: Set<string> = new Set<string>();
  private static siblings: string[] = [];
  private static initialDimensions: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  private static id: string;
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
    const parentId = store.getState().tree[id].parent;
    const positionsSnapshot = Object.entries(store.getState().tree).reduce(
      (acc, node) => {
        if (node[0] === ROOT_NODE_ID) return acc;
        return {
          ...acc,
          [node[0]]: {
            x: node[1].x,
            y: node[1].y,
          },
        };
      },
      {},
    );
    this.orginalPositions = positionsSnapshot;
    this.siblings = store
      .getState()
      .tree[parentId!].nodes.filter((nodeId) => nodeId !== id)
      .sort((a, b) => -store.getState().tree[a].y + store.getState().tree[b].y);
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
    const colCount = newWidth / gridCol;
    const rowCount = newHeight / gridRow;
    const newX = newLeft / gridCol;
    const newY = newTop / gridRow;
    return {
      rowsCount: rowCount,
      columnsCount: colCount,
      x: newX,
      y: newY,
    };
  }

  private static _move(mousePosition: Point) {
    const dims = this.calculateNewDimensions(
      mousePosition,
      this.id,
      this.initialDimensions,
      this.direction,
      this.resizingKey,
    );
    if (!dims) return;
    this.returnToOriginalPosition();
    const newCollisions = this._resize(this.id, dims, this.siblings);
    for (const collison of newCollisions) {
      this.collidingNodes.add(collison);
    }
    //filter elements that returned to their original position
    Object.entries(this.orginalPositions).forEach(([id, pos]) => {
      if (pos.y === store.getState().tree[id].y) {
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
    this.direction = [];
    this.initialDimensions = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    };
    this.orginalPositions = {};
    this.collidingNodes = new Set<string>();
    this.siblings = [];
  }

  private static returnToOriginalPosition() {
    Object.entries(this.orginalPositions).forEach(([id, pos]) => {
      if (id === this.id) return;
      setDimensions(id, {
        x: pos.x,
        y: pos.y,
      });
    });
  }

  private static returnToInitialDimensions(
    initialDimensions = this.initialDimensions,
  ) {
    const [gridRow, gridCol] = getGridSize(this.id);
    const { width, height, x, y } = initialDimensions;
    const colCount = width / gridCol;
    const rowCount = height / gridRow;
    const col = x / gridCol;
    const row = y / gridRow;
    setDimensions(this.id, {
      columnsCount: colCount,
      rowsCount: rowCount,
      x: col,
      y: row,
    });
  }

  public static end(mousePos: Point): UndoableCommand | null {
    if (!this.id) return null;
    const initialDimensions = this.initialDimensions;
    const affectedNodes = Array.from(this.collidingNodes);
    const undoData = affectedNodes.map((id) => ({
      id,
      x: this.orginalPositions[id].x,
      y: this.orginalPositions[id].y,
    }));
    const id = this.id;
    const key = this.resizingKey;
    const direction = this.direction;
    const siblings = this.siblings;
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
        this._resize(id, dims!, siblings);
      },
      undo: () => {
        this.returnToInitialDimensions(initialDimensions);
        undoData.forEach((data) => {
          setDimensions(data.id, {
            x: data.x,
            y: data.y,
          });
        });
      },
    };
    this.cleanUp();
    return command;
  }

  private static _cancel() {
    this.returnToOriginalPosition();
    this.returnToInitialDimensions();
    this.cleanUp();
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
    siblings: string[],
  ) {
    const collidedNodes = [];
    const tree = store.getState().tree;
    const node = tree[id];
    if (!node) return [];
    let left = dimensions.x || node.x;
    let top = dimensions.y || node.y;
    let rowCount = dimensions.rowsCount || node.rowsCount;
    let colCount = dimensions.columnsCount || node.columnsCount;
    const right = left + colCount;
    const bottom = top + rowCount;
    // console.log('before', {
    //   left,
    //   top,
    //   right,
    //   bottom,
    // });
    const nodes = siblings;
    const toBeMoved: { id: string; x?: number; y?: number }[] = [];
    nodes.forEach((nodeId) => {
      if (nodeId === id) return false;
      const otherNode = tree[nodeId];
      if (!otherNode) return false;
      const otherBottom = otherNode.y + otherNode.rowsCount;
      const otherTop = otherNode.y;
      const otherLeft = otherNode.x;
      const otherRight = otherNode.x + otherNode.columnsCount;
      if (
        checkOverlap(
          {
            left,
            top,
            right,
            bottom,
          },
          {
            left: otherLeft,
            top: otherTop,
            right: otherRight,
            bottom: otherBottom,
          },
        )
      ) {
        toBeMoved.push({ id: nodeId, y: bottom });
      }
    });
    const parent = tree[node.parent!];
    const parentLeft = parent.x;
    const parentRight = parent.x + parent.columnsCount;
    const parentTop = parent.y;
    if (right > parentRight) {
      colCount = Math.min(colCount, parentRight - left);
    }
    if (left < parentLeft) {
      colCount = right - parentLeft;
      left = parentLeft;
    }
    if (top < parentTop) {
      top = parentTop;
      rowCount = bottom - parentTop;
    }
    setDimensions(id, {
      x: left,
      y: top,
      columnsCount: colCount,
      rowsCount: rowCount,
    });
    for (const node of toBeMoved) {
      collidedNodes.push(node.id);
    }
    for (const node of toBeMoved) {
      const collied = moveNodeIntoGrid(
        node.id,
        {
          ...node,
        },
        false,
      );
      //todo find a better way to do this
      Object.entries(collied.changedNodesOriginalCoords).forEach(([id]) => {
        collidedNodes.push(id);
      });
    }
    return collidedNodes;
  }
}

export default ResizeAction;
