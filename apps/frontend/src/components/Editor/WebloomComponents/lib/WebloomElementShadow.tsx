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

    if (over.id === 'root' || over.id === active.id) {
        return (
            <ElementShadow
                width={el.width}
                height={el.height}
                top={el.y + delta.y}
                left={el.x + delta.x}
            />
        );
    }
    const overEl = store.getState().tree[over.id];
    const overDim = getBoundingRect(overEl);
    const activeDim = getBoundingRect(el);
    const mouseStart = getEventCoordinates(activatorEvent)!;
    const mousePos = { x: mouseStart.x + delta.x, y: mouseStart.y + delta.y };
    const threshold = 5;
    if (mousePos.y >= overDim.top) {
        if (
            mousePos.y <=
            overDim.top + (overDim.bottom - overDim.top) / 2 - threshold
        ) {
            return (
                <ElementShadow
                    width={el.width}
                    height={10}
                    top={overDim.top - 10}
                    left={el.x + delta.x}
                />
            );
        }
        return (
            <ElementShadow
                width={el.width}
                height={el.height}
                top={overDim.bottom}
                left={el.x + delta.x}
            />
        );
    }
    const tree = store.getState().tree;
    const parent = tree[el.id];
    const siblings = parent.nodes;
    return (
        <ElementShadow
            width={el.width}
            height={el.height}
            top={el.y + delta.y}
            left={el.x + delta.x}
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
