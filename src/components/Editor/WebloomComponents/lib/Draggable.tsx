import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useContext, useEffect, useMemo, useRef } from 'react';
import store from 'store';
import { WebloomContext } from './WebloomContext';
type DraggableProps = {
    children: React.ReactNode;
};
export const WebloomDraggable = (props: DraggableProps) => {
    const { id } = useContext(WebloomContext);
    const el = store.getState().tree[id];
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id
    });
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setNodeRef(ref.current);
    }, [setNodeRef]);

    const style = useMemo(() => {
        return {
            transform: CSS.Translate.toString(transform),
            top: el.y,
            left: el.x,
            position: 'relative',
            width: el.width,
            height: el.height
        } as React.CSSProperties;
    }, [transform, el.x, el.y, el.width, el.height]);

    return (
        <div
            id={`drag-${id}`}
            ref={ref}
            {...attributes}
            {...listeners}
            style={style}
        >
            {props.children}
        </div>
    );
};

export default WebloomDraggable;
