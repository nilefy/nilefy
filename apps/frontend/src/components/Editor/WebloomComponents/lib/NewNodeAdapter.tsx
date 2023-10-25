import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useMemo, useRef } from 'react';

type DraggableProps = {
  children: React.ReactNode;
  type: string;
  id: string;
};
export const NewNodeAdapter = (props: DraggableProps) => {
  const { id } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: {
      isNew: true,
      id: id,
      type: props.type,
    },
  });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setNodeRef(ref.current);
  }, [setNodeRef]);

  const style = useMemo(() => {
    return {
      transform: CSS.Translate.toString(transform),
      position: 'relative',
    } as React.CSSProperties;
  }, [transform]);

  return (
    <div
      id={`drag-${id}`}
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
