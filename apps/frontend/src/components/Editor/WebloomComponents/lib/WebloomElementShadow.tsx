import { getBoundingRect } from '@/lib/utils';
import store from '@/store';
import { useDndContext } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
//todo: refactor this entire file 🤮🤮🤮
export const WebloomElementShadow = () => {
    const { active, over, activatorEvent } = useDndContext();
    if (!active || !over || !activatorEvent) {
        return null;
    }
    const tree = store.getState().tree;

    const el = tree[active.id];
    const parentId = el.parent!;
    const translated = active.rect.current.translated!;
    const initial = active.rect.current.initial!;
    const parent = tree[parentId];
    const [gridrow, gridcol] = store.getState().getGridSize(el.id);
    const delta = {
        x: translated.left - initial.left,
        y: translated.top - initial.top
    };

    const overEl = tree[over.id];

    const overBoundingRect = store
        .getState()
        .getBoundingRect(over.id as string);
    const mouseStart = getEventCoordinates(activatorEvent)!;
    const mousePos = { x: mouseStart.x + delta.x, y: mouseStart.y + delta.y };
    //todo: make threshold relative to parent's grid size
    const threshold = 5;
    if (!parentId) return null;
    const siblings = parent.nodes;
    const oldLeft = el.x * gridcol + delta.x;
    let top = el.y + delta.y / gridrow;
    let left = el.x + delta.x / gridcol;
    let colCount = el.columnsCount;
    const rowCount = el.rowsCount;
    const right = left + colCount;
    const bottom = top + rowCount;
    const width = colCount * gridcol;
    const height = rowCount * gridrow;
    for (const sibling of siblings) {
        if (sibling === active.id) {
            continue;
        }
        const otherNode = tree[sibling];
        const otherBottom = otherNode.y + otherNode.rowsCount;
        const otherTop = otherNode.y;
        const otherLeft = otherNode.x;
        const otherRight = otherNode.x + otherNode.columnsCount;
        if (top < otherBottom && top >= otherTop) {
            if (left < otherLeft && left + colCount > otherLeft) {
                colCount = Math.min(colCount, otherLeft - left);
                if (colCount < 2) {
                    left = otherLeft - 2;
                    colCount = 2;
                }
            } else if (left >= otherLeft && left < otherRight) {
                const temp = left;
                left = otherRight;
                colCount += temp - left;
                if (colCount < 2) {
                    colCount = 2;
                }
            }
        }
    }
    const parentLeft = parent.x;
    const parentRight = parent.x + parent.columnsCount;
    if (right > parentRight) {
        colCount = Math.min(colCount, parentRight - left);
        if (colCount < 1) {
            colCount = 1;
        }
    }
    if (left < parentLeft) {
        colCount = right - parentLeft;
        left = parentLeft;
        if (colCount < 1) {
            colCount = 1;
        }
    }
    const newWidth = colCount * gridcol;
    top = Math.round(top * gridrow);
    left = Math.round(left * gridcol);
    if (over.id === 'root' || over.id === active.id) {
        return (
            <ElementShadow
                width={newWidth}
                height={height}
                top={top}
                left={left}
            />
        );
        //todo check if element is canvas or not
    } else if (overEl) {
        //this the part that handles putting the shadow before or after the element when it's over it
        if (
            mousePos.y <=
            overBoundingRect.top +
                (overBoundingRect.bottom - overBoundingRect.top) / 2 -
                threshold
        ) {
            return (
                <ElementShadow
                    width={width}
                    height={10}
                    top={overBoundingRect.top - 10}
                    left={oldLeft}
                />
            );
        }
        return (
            <ElementShadow
                width={width}
                height={height}
                top={overBoundingRect.bottom}
                left={oldLeft}
            />
        );
    }
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
                transform: `translate(${left}px, ${top}px)`
            }}
        ></div>
    );
}
