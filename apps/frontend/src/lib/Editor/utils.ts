import { Point } from '@/types';
import { editorStore } from './Models';
import { isPlainObject } from 'lodash';
import {
  BoundingRect,
  WebloomGridDimensions,
  WebloomPixelDimensions,
} from './interface';

export const getDOMInfo = (el: HTMLElement) => {
  const { top, left, width, height } = el.getBoundingClientRect();
  return {
    x: left,
    y: top,
    width,
    height,
  };
};
export const getBoundingRect = (dim: WebloomPixelDimensions) => {
  return {
    top: dim.y,
    left: dim.x,
    width: dim.width,
    height: dim.height,
    bottom: dim.y + dim.height,
    right: dim.x + dim.width,
  };
};
export const getGridBoundingRect = (dim: WebloomGridDimensions) => {
  return {
    top: dim.row,
    left: dim.col,
    width: dim.columnsCount,
    height: dim.rowsCount,
    bottom: dim.row + dim.rowsCount,
    right: dim.col + dim.columnsCount,
  };
};
export const getWidgetsBoundingRect = (
  widgets: {
    id: string;
    boundingRect: BoundingRect;
  }[],
) => {
  let left = Infinity;
  let right = 0;
  let top = Infinity;
  let bottom = 0;

  for (const widget of widgets) {
    const { left: wl, right: wr, top: wt, bottom: wb } = widget.boundingRect;
    left = Math.min(left, wl);
    right = Math.max(right, wr);
    top = Math.min(top, wt);
    bottom = Math.max(bottom, wb);
  }

  return {
    left,
    right,
    top,
    bottom,
  };
};
export function normalizePoint(
  point: [number, number],
  grid: number,
): [number, number];
export function normalizePoint(
  point: { x: number; y: number },
  grid: number,
): { x: number; y: number };
export function normalizePoint(
  point: [number, number] | { x: number; y: number },
  grid: number,
) {
  if (Array.isArray(point)) {
    return [normalize(point[0], grid), normalize(point[1], grid)] as const;
  }
  return {
    y: normalize(point.y, grid),
    x: normalize(point.x, grid),
  };
}
/*
 * Normalize a value to the nearest multiple of a given grid size
 * @param {number} x - The value to normalize
 * @param {number} grid - The length to normalize to
 * @returns {number} The normalized value
 */
export function normalize(x: number, grid: number) {
  return Math.round(x / grid) * grid;
}

export function checkOverlap(
  a: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  },
  b: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  },
): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}
export function convertPixelToGrid(
  dims: WebloomPixelDimensions,
  grid: [number, number],
  parentDims: Pick<WebloomPixelDimensions, 'x' | 'y'>,
): WebloomGridDimensions {
  return {
    col: Math.round((dims.x - parentDims.x) / grid[1]),
    row: Math.round((dims.y - parentDims.y) / grid[0]),
    columnsCount: Math.round(dims.width / grid[1]),
    rowsCount: Math.round(dims.height / grid[0]),
  };
}
export function convertGridToPixel(
  dims: WebloomGridDimensions,
  grid: [number, number],
  parentDims: Pick<WebloomPixelDimensions, 'x' | 'y'> = {
    x: 0,
    y: 0,
  },
): WebloomPixelDimensions {
  const [gridrow, gridcol] = grid;
  return {
    x: dims.col * gridcol + parentDims.x,
    y: dims.row * gridrow + parentDims.y,
    width: dims.columnsCount * gridcol,
    height: dims.rowsCount * gridrow,
  };
}
export function isSameCoords(
  newCoords: WebloomGridDimensions,
  node: WebloomGridDimensions,
) {
  return (
    newCoords.row === node.row &&
    newCoords.col === node.col &&
    newCoords.columnsCount === node.columnsCount &&
    newCoords.rowsCount === node.rowsCount
  );
}
export function normalizeCoords(
  newCoords: Partial<WebloomGridDimensions>,
  node: WebloomGridDimensions,
): WebloomGridDimensions {
  return {
    row: newCoords.row ?? node.row,
    col: newCoords.col ?? node.col,
    columnsCount: newCoords.columnsCount ?? node.columnsCount,
    rowsCount: newCoords.rowsCount ?? node.rowsCount,
  };
}

export function isPointInsideBoundingRect(
  point: Point,
  boundingRect: BoundingRect,
) {
  return (
    point.x > boundingRect.left &&
    point.x < boundingRect.right &&
    point.y > boundingRect.top &&
    point.y < boundingRect.bottom
  );
}

export const getMousePositionRelativeToEditor = (clientOffset: Point) => {
  if (!editorStore.currentPage.rootWidget.canvas) return clientOffset;
  const boundingRect =
    editorStore.currentPage.rootWidget.canvas.getBoundingClientRect();
  return getMousePositionRelativeToBoundingRect(clientOffset, boundingRect);
};

export const getMousePositionRelativeToBoundingRect = (
  clientOffset: Point,
  boundingRect: BoundingRect,
) => {
  return {
    x: clientOffset.x - boundingRect.left,
    y: clientOffset.y - boundingRect.top,
  };
};
export function isObject(val: unknown): val is Record<string, unknown> {
  return isPlainObject(val);
}
