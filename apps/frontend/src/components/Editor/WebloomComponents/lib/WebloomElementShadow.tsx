import { getBoundingRect } from '@/lib/utils';
import store from '@/store';
import { DragOverlay, useDndContext, useDraggable } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';

export const WebloomElementShadow = () => {
    const { active, over, activatorEvent } = useDndContext();
    if (!active || !over || !activatorEvent) {
        return null;
    }
    const el = store.getState().tree[active.id];
    const translated = active.rect.current.translated!;
    const initial = active.rect.current.initial!;
    const delta = {
        x: translated.left - initial.left,
        y: translated.top - initial.top
    };

    const overEl = store.getState().tree[over.id];
    const overDim = getBoundingRect(overEl);
    const activeDim = getBoundingRect(el);
    const mouseStart = getEventCoordinates(activatorEvent)!;
    const mousePos = { x: mouseStart.x + delta.x, y: mouseStart.y + delta.y };
    const threshold = 5;
    const tree = store.getState().tree;
    if (!el.parent) return null;
    const parent = tree[el.parent];
    const siblings = parent.nodes;
    let newWidth = el.width;
    console.log(siblings);
    let newLeft = el.x + delta.x;
    const newTop = el.y + delta.y;
    const oldLeft = el.x + delta.x;
    const newBottom = newTop + el.height;
    for (const sibling of siblings) {
        if (sibling === el.id) {
            continue;
        }
        const otherNode = tree[sibling];
        const otherDim = getBoundingRect(otherNode);

        if (newTop < otherDim.bottom && newTop >= otherDim.top) {
            if (newLeft < otherDim.left && newLeft + newWidth > otherDim.left) {
                newWidth = Math.min(newWidth, otherDim.left - newLeft);
                continue;
            }
            if (newLeft > otherDim.left && newLeft < otherDim.right) {
                const temp = newLeft;
                newLeft = otherDim.right;
                newWidth += temp - newLeft;
            }
        }
    }
    if (over.id === 'root' || over.id === active.id) {
        return (
            <ElementShadow
                width={newWidth}
                height={el.height}
                top={newTop}
                left={newLeft}
            />
        );
    } else if (overEl) {
        if (
            mousePos.y <=
            overDim.top + (overDim.bottom - overDim.top) / 2 - threshold
        ) {
            return (
                <ElementShadow
                    width={el.width}
                    height={10}
                    top={overDim.top - 10}
                    left={oldLeft}
                />
            );
        }
        return (
            <ElementShadow
                width={el.width}
                height={el.height}
                top={overDim.bottom}
                left={oldLeft}
            />
        );
    }
    return (
        <ElementShadow
            width={newWidth}
            height={el.height}
            top={newTop}
            left={newLeft}
        />
    );
};

function ElementShadow({
    width,
    height,
    top,
    left
}: {
    width: number;
    height: number;
    top: number;
    left: number;
}) {
    return (
        <div
            className="absolute z-50 bg-gray-500 opacity-50"
            style={{
                width: width,
                height: height,
                top: top,
                left: left
            }}
        ></div>
    );
}
