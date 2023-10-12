import { useDroppable } from '@dnd-kit/core';
import { useContext, useEffect, useRef } from 'react';
import { WebloomContext } from './WebloomContext';

type WebloomDropProps = {
    children: React.ReactNode;
};
const WebloomDroppable = (props: WebloomDropProps) => {
    const { id } = useContext(WebloomContext);
    const { setNodeRef } = useDroppable({
        id: id
    });

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setNodeRef(ref.current);
    }, [setNodeRef]);
    return (
        <div id={`drop-${id}`} className="h-full w-full" ref={ref}>
            {props.children}
        </div>
    );
};

export { WebloomDroppable };
