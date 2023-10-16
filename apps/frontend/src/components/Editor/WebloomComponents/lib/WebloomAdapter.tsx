import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import store from '../../../../store';
import { WebloomContext } from './WebloomContext';
import { GRID_CELL_SIDE } from '../../../../lib/constants';
import { CSS } from '@dnd-kit/utilities';

type WebloomAdapterProps = {
    children: React.ReactNode;
    draggable?: boolean;
    droppable?: boolean;
    resizable?: boolean;
};
const handlePositions = {
    'top-left': [0, 0],
    'top-right': [0, 1],
    'bottom-left': [1, 0],
    'bottom-right': [1, 1],
    top: [0, 0.5],
    bottom: [1, 0.5],
    left: [0.5, 0],
    right: [0.5, 1]
} as const;

const cursors = {
    'top-left': 'nwse-resize',
    'top-right': 'nesw-resize',
    'bottom-left': 'nesw-resize',
    'bottom-right': 'nwse-resize',
    top: 'ns-resize',
    bottom: 'ns-resize',
    left: 'ew-resize',
    right: 'ew-resize'
} as const;
const { resizeNode } = store.getState();
export const WebloomAdapter = (props: WebloomAdapterProps) => {
    const [resizingKey, setResizingKey] = useState<null | keyof typeof cursors>(
        null
    );
    const [initialDimensions, setInitialDimensions] = useState<{
        width: number;
        height: number;
        x: number;
        y: number;
    }>({
        width: 0,
        height: 0,
        x: 0,
        y: 0
    });

    const { id } = useContext(WebloomContext);
    const selected = store((state) => state.selectedNode) === id;

    const { setNodeRef: setDropNodeRef } = useDroppable({
        id: id,
        disabled: !props.droppable
    });
    const el = store().tree[id];
    //todo change to parent when nesting is implemented
    const root = store().tree['root'];
    const ref = useRef<HTMLDivElement>(null);
    const elDimensions = store.getState().getDimensions(id);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        disabled: !props.draggable && resizingKey === null,
        data: {
            isNew: false
        }
    });
    const modListeners = useMemo(() => {
        if (!listeners)
            return {
                onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    store.getState().setSelectedNode(id);
                }
            };
        return {
            ...listeners,
            onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                store.getState().setSelectedNode(id);
                listeners.onMouseDown(e);
            }
        };
    }, [listeners, id]);
    useEffect(() => {
        setNodeRef(ref.current);
        setDropNodeRef(ref.current);
    }, [setDropNodeRef, setNodeRef]);
    const style = useMemo(() => {
        return {
            top: elDimensions.y,
            left: elDimensions.x,
            position: 'absolute',
            width: elDimensions.width,
            height: elDimensions.height,
            visibility: isDragging ? 'hidden' : 'visible'
        } as React.CSSProperties;
    }, [
        elDimensions.x,
        elDimensions.y,
        elDimensions.width,
        elDimensions.height,
        isDragging
    ]);
    const handles = useMemo(() => {
        if (!props.resizable) return null;
        const handleSize = 10;
        const handleStyle: React.CSSProperties = {
            position: 'absolute',
            width: handleSize,
            height: handleSize,
            backgroundColor: 'white',
            border: '1px solid black',
            borderRadius: '50%'
        };
        return (
            !isDragging &&
            selected && (
                <div
                    className="select-none"
                    style={{
                        position: 'absolute',
                        top: style.top,
                        left: style.left,
                        transform: style.transform
                    }}
                >
                    {Object.entries(handlePositions).map(([key, [y, x]]) => {
                        let left = 0;
                        const width = parseInt(style.width?.toString() || '0');
                        const height = parseInt(
                            style.height?.toString() || '0'
                        );
                        if (x === 0) {
                            left = -handleSize / 2;
                        } else if (x === 1) {
                            left = width - handleSize / 2;
                        } else {
                            left = width / 2 - handleSize / 2;
                        }
                        let top = 0;
                        if (y === 0) {
                            top = -handleSize / 2;
                        } else if (y === 1) {
                            top = height - handleSize / 2;
                        } else {
                            top = height / 2 - handleSize / 2;
                        }
                        return (
                            <div
                                key={key}
                                className={`absolute ${key}`}
                                style={{
                                    ...handleStyle,
                                    top,
                                    left,
                                    cursor: cursors[key as keyof typeof cursors]
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setResizingKey(key as keyof typeof cursors);
                                    setInitialDimensions({
                                        width: elDimensions.width,
                                        height: elDimensions.height,
                                        x: elDimensions.x,
                                        y: elDimensions.y
                                    });
                                }}
                                onMouseUp={() => setResizingKey(null)}
                            ></div>
                        );
                    })}
                </div>
            )
        );
    }, [props.resizable, style, el, selected, isDragging]);
    useEffect(() => {
        const resizeHandler = (e: MouseEvent) => {
            if (resizingKey === null) return;
            if (!root.dom) return;
            e.stopPropagation();
            const direction = resizingKey.split('-');
            const { width: initialWidth, height: initialHeight } =
                initialDimensions;
            const { x: initialLeft, y: initialTop } = initialDimensions;
            const initialRight = initialLeft + initialWidth;
            const initialBottom = initialTop + initialHeight;
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;
            const minWidth = 100;
            const minHeight = 50;
            let [x, y] = [e.clientX, e.clientY];
            const rect = root.dom.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            if (direction.includes('top')) {
                const diff = initialTop - y;
                const snappedDiff =
                    Math.round(diff / GRID_CELL_SIDE) * GRID_CELL_SIDE;
                newHeight += snappedDiff;
                newTop -= snappedDiff;
                if (newHeight < minHeight) {
                    newHeight = minHeight;
                    newTop = initialTop + initialHeight - minHeight;
                }
            }
            if (direction.includes('bottom')) {
                const diff = y - initialBottom;
                const snappedDiff =
                    Math.round(diff / GRID_CELL_SIDE) * GRID_CELL_SIDE;
                newHeight += snappedDiff;
                if (newHeight < minHeight) {
                    newHeight = minHeight;
                }
            }
            if (direction.includes('left')) {
                const diff = initialLeft - x;
                const snappedDiff =
                    Math.round(diff / GRID_CELL_SIDE) * GRID_CELL_SIDE;
                newWidth += snappedDiff;
                newLeft -= snappedDiff;
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                    newLeft = initialLeft + initialWidth - minWidth;
                }
            }
            if (direction.includes('right')) {
                const diff = x - initialRight;
                const snappedDiff =
                    Math.round(diff / GRID_CELL_SIDE) * GRID_CELL_SIDE;
                newWidth += snappedDiff;
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                }
            }
            resizeNode(id, {
                width: newWidth,
                height: newHeight,
                x: newLeft,
                y: newTop
            });
        };
        const resizeEndHandler = () => {
            setResizingKey(null);
        };
        const rootDom = root.dom;
        const el = ref.current;
        if (rootDom === null) return;
        if (el === null) return;
        rootDom.addEventListener('mousemove', resizeHandler);
        el.addEventListener('mousemove', resizeHandler);
        rootDom.addEventListener('mouseup', resizeEndHandler);
        el.addEventListener('mouseup', resizeEndHandler);

        return () => {
            rootDom.removeEventListener('mousemove', resizeHandler);
            el.removeEventListener('mousemove', resizeHandler);
            rootDom.removeEventListener('mouseup', resizeEndHandler);
            el.removeEventListener('mouseup', resizeEndHandler);
        };
    }, [
        resizingKey,
        elDimensions.width,
        elDimensions.height,
        elDimensions.x,
        elDimensions.y,
        id,
        el,
        initialDimensions,
        root.dom
    ]);
    return (
        <>
            <div
                {...modListeners}
                {...attributes}
                style={style}
                ref={ref}
                className="touch-none"
            >
                {props.children}
            </div>
            {handles}
        </>
    );
};
