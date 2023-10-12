import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import store from '@/store';
import { WebloomContext } from './WebloomContext';

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
const { setDimensions } = store.getState();
export const WebloomAdapter = (props: WebloomAdapterProps) => {
    const [resizingKey, setResizingKey] = useState<null | keyof typeof cursors>(
        null
    );
    const [resizineStartPos, setResizingStartPos] = useState([0, 0]);
    const { id } = useContext(WebloomContext);
    const { setNodeRef: setDropNodeRef } = useDroppable({
        id: id,
        disabled: !props.droppable
    });
    const el = store.getState().tree[id];
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        disabled: !props.draggable
    });
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setNodeRef(ref.current);
        setDropNodeRef(ref.current);
    }, [setNodeRef, setDropNodeRef]);

    const style = useMemo(() => {
        return {
            transform: CSS.Translate.toString(transform),
            top: el.y,
            left: el.x,
            position: 'absolute',
            width: el.width,
            height: el.height
        } as React.CSSProperties;
    }, [transform, el.x, el.y, el.width, el.height]);
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
            <div
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
                    const height = parseInt(style.height?.toString() || '0');
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
                            draggable={false}
                            className={`absolute ${key}`}
                            style={{
                                ...handleStyle,
                                top,
                                left,
                                cursor: cursors[key as keyof typeof cursors]
                            }}
                            onMouseDown={(e) => {
                                setResizingStartPos([e.clientX, e.clientY]);
                                setResizingKey(key as keyof typeof cursors);
                            }}
                        ></div>
                    );
                })}
            </div>
        );
    }, [props.resizable, style]);
    useEffect(() => {
        const resizeHandler = (e: MouseEvent) => {
            if (!resizingKey) return;
            e.stopPropagation();
            const offsetX = e.clientX - resizineStartPos[0];
            const offsetY = e.clientY - resizineStartPos[1];
            setResizingStartPos([e.clientX, e.clientY]);
            const width = el.width;
            const height = el.height;
            const minWidth = 30;
            const minHeight = 30;
            const maxWidth = Infinity;
            const maxHeight = Infinity;
            const direction = resizingKey.split('-');
            let newWidth = width;
            let newHeight = height;
            let left = el.x;
            let top = el.y;
            if (direction.includes('left')) {
                newWidth -= offsetX;
                left += offsetX;
            }
            if (direction.includes('right')) {
                newWidth += offsetX;
            }
            if (direction.includes('top')) {
                newHeight -= offsetY;
                top += offsetY;
            }
            if (direction.includes('bottom')) {
                newHeight += offsetY;
            }
            if (newWidth < minWidth) {
                newWidth = minWidth;
                left = el.x;
            }
            if (newHeight < minHeight) {
                newHeight = minHeight;
                top = el.y;
            }
            if (newWidth > maxWidth) {
                newWidth = maxWidth;
                left = el.x;
            }
            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                top = el.y;
            }

            const newStyle = {
                width: newWidth,
                height: newHeight,
                x: left,
                y: top
            };
            setDimensions(id, newStyle);
        };
        const resizeEndHandler = () => {
            setResizingKey(null);
        };
        window.addEventListener('mousemove', resizeHandler);
        window.addEventListener('mouseup', resizeEndHandler);
        return () => {
            window.removeEventListener('mousemove', resizeHandler);
            window.removeEventListener('mouseup', resizeEndHandler);
        };
    }, [resizingKey, resizineStartPos, el.width, el.height, el.x, el.y, id]);
    return (
        <>
            <div {...listeners} {...attributes} style={style} ref={ref}>
                {props.children}
            </div>
            {handles}
        </>
    );
};
