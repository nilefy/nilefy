import store from '@/store';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef } from 'react';

type DraggableProps = {
    children: React.ReactNode;
    type: string;
};
export const NewNodeAdapter = (props: DraggableProps) => {
    const id = useRef(nanoid());
    const wholeTree = store.getState().tree;
    const treeLen = Object.keys(wholeTree).length;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id.current,
        data: {
            isNew: true,
            id: id.current,
            type: props.type
        }
    });
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setNodeRef(ref.current);
    }, [setNodeRef]);
    useEffect(() => {
        id.current = nanoid();
    }, [treeLen]);
    const style = useMemo(() => {
        return {
            transform: CSS.Translate.toString(transform),
            position: 'relative'
        } as React.CSSProperties;
    }, [transform]);

    return (
        <div
            id={`drag-${nanoid()}`}
            ref={ref}
            {...attributes}
            {...listeners}
            style={style}
            className="z-50"
        >
            {props.children}
        </div>
    );
};

export default NewNodeAdapter;
