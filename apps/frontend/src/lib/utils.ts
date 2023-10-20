import { WebloomNodeDimensions } from '@/store';

export const getDOMInfo = (el: HTMLElement) => {
  const { top, left, width, height } = el.getBoundingClientRect();
  return {
    x: left,
    y: top,
    width,
    height,
  };
};
export const getBoundingRect = (dim: WebloomNodeDimensions) => {
  return {
    top: dim.y,
    left: dim.x,
    width: dim.width,
    height: dim.height,
    bottom: dim.y + dim.height,
    right: dim.x + dim.width,
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
