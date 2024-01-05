import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { UseDraggableArguments, useDraggable } from '@dnd-kit/core';

export const useWebloomDraggable = (args: UseDraggableArguments) => {
  const draggable = useDraggable(args);
  const draggedNode = editorStore.currentPage.draggedWidgetId;
  // const draggedNode = store((state) => state.draggedNode);

  return {
    ...draggable,
    isDragging: draggable.isDragging && draggedNode === args.id,
  };
};
