import { useDraggable } from '@dnd-kit/core';
import { useEffect, useRef } from 'react';

type DraggableProps = {
  children: React.ReactNode;
  type: string;
};
export const NewNodeAdapter = (props: DraggableProps) => {
  const id = useRef(props.type);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: id.current,
    data: {
      isNew: true,
      id: id.current,
      type: props.type,
    },
  });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setNodeRef(ref.current);
  }, [setNodeRef]);

  return (
    <div ref={ref} {...attributes} {...listeners} className="relative z-50">
      {props.children}
    </div>
  );
};

export default NewNodeAdapter;
