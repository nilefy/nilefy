import store from '@/store';
import { Command } from '../types';
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
const { resizeNode, getGridSize } = store.getState();
class ResizeAction {
  public static resizingKey: ResizingKeys | null = null;
  private static direction: MainResizingKeys[];
  private static orginalPositions: Record<string, Point> = {};
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

    const orgpos = resizeNode(this.id, {
      rowsCount: rowCount,
      columnsCount: colCount,
      x: newX,
      y: newY,
    });
    this.orginalPositions = {
      ...orgpos.changedNodesOriginalCoords,
      ...this.orginalPositions,
    };
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
  }
}

export default ResizeAction;
