import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  //   console.log(id, children);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // console.log(rest);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export { SortableItem };
