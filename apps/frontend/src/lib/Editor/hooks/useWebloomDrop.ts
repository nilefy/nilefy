import { useDrop } from 'react-dnd';
import { DraggedItem } from '../dnd/interface';
import { handleDrop, handleHover } from '../dnd/handlers';
import { editorStore } from '../Models';

export const useWebloomDrop = (id: string) => {
  const [, drop] = useDrop(() => ({
    accept: 'WIDGET',
    hover(item, monitor) {
      handleHover(item as DraggedItem, monitor, id);
    },
    drop(item, monitor) {
      handleDrop(item as DraggedItem, monitor, id);
    },
    canDrop() {
      if (editorStore.currentPage.resizedWidgetId !== null) return false;
      return true;
    },
  }));
  return drop;
};
