import { useDrag } from 'react-dnd';
import { DraggedItem } from '../dnd/interface';
import { editorStore } from '../Models';

export const useWebloomDrag = (item: DraggedItem) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET',
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => {
      if (editorStore.currentPage.resizedWidgetId !== null) return false;
      return true;
    },
    end: () => {
      editorStore.currentPage.setDraggedWidgetId(null);
    },
  }));
  return [{ isDragging }, drag] as const;
};
