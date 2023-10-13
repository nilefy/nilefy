import type { Modifier } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { GRID_CELL_SIDE } from './constants';
import store from '@/store';

export const getDOMInfo = (el: HTMLElement) => {
    const { top, left, width, height } = el.getBoundingClientRect();
    return {
        x: left,
        y: top,
        width,
        height
    };
};

export const restrictToParentElementUnlessNew: Modifier = (args) => {
    if (args.active?.data?.current?.isNew) return args.transform;
    return restrictToParentElement(args);
};

export const snapModifier: Modifier = (args) => {
    const tree = store.getState().tree;

    if (args.over?.id && tree[args.over.id]) {
        return {
            ...args.transform,
            y: Math.round(args.transform.y / GRID_CELL_SIDE) * GRID_CELL_SIDE,
            x: Math.round(args.transform.x / GRID_CELL_SIDE) * GRID_CELL_SIDE
        };
    }
    return args.transform;
};
