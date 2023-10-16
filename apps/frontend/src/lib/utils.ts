import type { Modifier } from '@dnd-kit/core';
import {
    restrictToParentElement,
    restrictToWindowEdges
} from '@dnd-kit/modifiers';
import { GRID_CELL_SIDE, NUMBER_OF_COLUMNS, ROW_HEIGHT } from './constants';
import store, { WebloomNodeDimensions } from '@/store';

export const getDOMInfo = (el: HTMLElement) => {
    const { top, left, width, height } = el.getBoundingClientRect();
    return {
        x: left,
        y: top,
        width,
        height
    };
};
export const getBoundingRect = (dim: WebloomNodeDimensions) => {
    return {
        top: dim.y,
        left: dim.x,
        width: dim.width,
        height: dim.height,
        bottom: dim.y + dim.height,
        right: dim.x + dim.width
    };
};
export const restrictToParentElementUnlessNew: Modifier = (args) => {
    if (args.active?.data?.current?.isNew) return restrictToWindowEdges(args);
    return restrictToParentElement(args);
};

export const snapModifier: Modifier = (args) => {
    const tree = store.getState().tree;
    let target = args.over?.id || 'root';
    if (!tree[target] || !tree[target].isCanvas) target = 'root';
    const gridSize = tree[target].width / NUMBER_OF_COLUMNS;
    const x = normalize(args.transform.x, gridSize);
    const y = normalize(args.transform.y, ROW_HEIGHT);
    if (args.over?.id && tree[args.over.id]) {
        return {
            ...args.transform,
            x,
            y
        };
    }
    return args.transform;
};

export function normalizePoint(
    point: [number, number],
    grid?: number
): [number, number];
export function normalizePoint(
    point: { x: number; y: number },
    grid?: number
): { x: number; y: number };
export function normalizePoint(
    point: [number, number] | { x: number; y: number },
    grid: number = GRID_CELL_SIDE
) {
    if (Array.isArray(point)) {
        return [normalize(point[0], grid), normalize(point[1], grid)] as const;
    }
    return {
        y: normalize(point.y, grid),
        x: normalize(point.x, grid)
    };
}

export function normalize(x: number, grid: number) {
    return Math.round(x / grid) * grid;
}
