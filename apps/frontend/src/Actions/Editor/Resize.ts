import store from '@/store';
import { Command } from '../types';
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
  private static _move(mousePosition: Point) {
    if (this.resizingKey === null) return;
    const root = store.getState().tree[ROOT_NODE_ID];
    if (!root.dom) return;
    const direction = this.direction;
    const { width: initialWidth, height: initialHeight } =
      this.initialDimensions;
    const { x: initialLeft, y: initialTop } = this.initialDimensions;
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

    const [gridRow, gridCol] = getGridSize(this.id);
    const minWidth = gridCol * 2;
    const minHeight = gridRow * 10;
    if (direction.includes('top')) {
      const diff = initialTop - y;
      const snappedDiff = normalize(diff, gridRow);
      newHeight += snappedDiff;
      newTop -= snappedDiff;
      if (newHeight < minHeight) {
        newHeight = minHeight;
        newTop = initialTop + initialHeight - minHeight;
      }
    } else if (direction.includes('bottom')) {
      const diff = y - initialBottom;
      const snappedDiff = normalize(diff, gridRow);
      newHeight += snappedDiff;
      if (newHeight < minHeight) {
        newHeight = minHeight;
      }
    }
    if (direction.includes('left')) {
      const diff = initialLeft - x;
      const snappedDiff = normalize(diff, gridCol);
      newWidth += snappedDiff;
      newLeft -= snappedDiff;
      if (newWidth < minWidth) {
        newWidth = minWidth;
        newLeft = initialLeft + initialWidth - minWidth;
      }
    } else if (direction.includes('right')) {
      const diff = x - initialRight;
      const snappedDiff = normalize(diff, gridCol);
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
    Object.entries(this.orginalPositions).forEach(([id, pos]) => {
      if (id === this.id) return;
      setDimensions(id, {
        x: pos.x,
        y: pos.y,
      });
    });
    this._resize({
      rowsCount: rowCount,
      columnsCount: colCount,
      x: newX,
      y: newY,
    });

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
  public static _end() {
    this.resizingKey = null;
    this.direction = [];
    this.initialDimensions = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    };
    this.orginalPositions = {};
  }

  private static _resize(
    dimensions: Partial<{
      x: number;
      y: number;
      width: number;
      height: number;
      rowsCount: number;
      columnsCount: number;
    }>,
  ) {
    const changedNodesOriginalCoords: Record<string, Point> = {};
    const tree = store.getState().tree;
    const node = tree[this.id];
    if (!node)
      return {
        changedNodesOriginalCoords,
      };
    const left = dimensions.x || node.x;
    const top = dimensions.y || node.y;
    const rowCount = dimensions.rowsCount || node.rowsCount;
    const colCount = dimensions.columnsCount || node.columnsCount;
    const right = left + colCount;
    const bottom = top + rowCount;
    const nodes = this.siblings;
    const toBeMoved: { id: string; x?: number; y?: number }[] = [];
    nodes.forEach((nodeId) => {
      if (nodeId === this.id) return false;
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
    setDimensions(this.id, {
      ...dimensions,
    });
    for (const node of toBeMoved) {
      this.collidingNodes.add(node.id);
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
        this.collidingNodes.add(id);
      });
    }
  }
}

export default ResizeAction;
