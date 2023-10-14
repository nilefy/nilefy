import type { Modifier } from '@dnd-kit/core';
import {
    restrictToParentElement,
    restrictToWindowEdges
} from '@dnd-kit/modifiers';
import { GRID_CELL_SIDE } from './constants';
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
    if (args.over?.id && tree[args.over.id]) {
        return {
            ...args.transform,
            ...normalize(args.transform)
        };
    }
    return args.transform;
};
export function normalize(
    point: [number, number],
    grid?: number
): [number, number];
export function normalize(
    point: { x: number; y: number },
    grid?: number
): { x: number; y: number };
export function normalize(
    point: [number, number] | { x: number; y: number },
    grid: number = GRID_CELL_SIDE
) {
    if (Array.isArray(point)) {
        return [
            Math.round(point[0] / grid) * grid,
            Math.round(point[1] / grid) * grid
        ] as const;
    }
    return {
        y: Math.round(point.y / grid) * grid,
        x: Math.round(point.x / grid) * grid
    };
}
