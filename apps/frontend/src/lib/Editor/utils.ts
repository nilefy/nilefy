import {
  DebounceSettings,
  DebouncedFunc,
  debounce,
  isPlainObject,
  memoize,
} from 'lodash';
import { WebloomGridDimensions, WebloomPixelDimensions } from './interface';

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
export function isObject(val: unknown): val is Record<string, unknown> {
  return isPlainObject(val);
}

export interface MemoizeDebouncedFunction<
  F extends (...args: unknown[]) => unknown,
> {
  (...args: Parameters<F>): void;
  flush: (...args: Parameters<F>) => void;
}

export function memoizeDebounce<F extends (...args: any[]) => any>(
  func: F,
  wait = 0,
  options: DebounceSettings = {},
  resolver?: (...args: Parameters<F>) => unknown,
): MemoizeDebouncedFunction<F> {
  const debounceMemo = memoize<(...args: Parameters<F>) => DebouncedFunc<F>>(
    (..._args: Parameters<F>) => debounce(func, wait, options),
    resolver,
  );

  function wrappedFunction(
    this: MemoizeDebouncedFunction<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined {
    return debounceMemo(...args)(...args);
  }

  wrappedFunction.flush = (...args: Parameters<F>): void => {
    debounceMemo(...args).flush();
  };

  return wrappedFunction as unknown as MemoizeDebouncedFunction<F>;
}
