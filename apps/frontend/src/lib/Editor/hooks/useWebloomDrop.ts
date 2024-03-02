import { useDrop } from 'react-dnd';
import { DraggedItem } from '../dnd/interface';
import { handleDrop, handleHover } from '../dnd/handlers';
import { editorStore } from '../Models';
import { useEffect } from 'react';

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
      if (editorStore.currentPage.isResizing) return false;
      return true;
    },
  }));
  const widget = editorStore.currentPage.getWidgetById(id);
  const canvas = widget?.canvas;
  useEffect(() => {
    if (canvas) {
      drop(canvas);
    }
    return () => {
      drop(null);
    };
  }, [canvas, drop, widget.dom]);
};
