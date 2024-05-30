import { useDrag } from 'react-dnd';
import { DraggedItem, ExistingDraggedItem } from '../dnd/interface';
import { editorStore } from '../Models';
import { useEffect } from 'react';

export const useWebloomDragCore = (item: DraggedItem) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET',
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => {
      if (editorStore.currentPage.isResizing) return false;
      return true;
    },
    end: () => {
      editorStore.currentPage.setDraggedWidgetId(null);
      editorStore.currentPage.setIsPermatureDragging(false);
      editorStore.currentPage.setShadowElement(null);
    },
  }));
  if (isDragging && !editorStore.currentPage.isPrematureDragging) {
    editorStore.currentPage.setIsPermatureDragging(true);
  }
  return [{ isDragging }, drag] as const;
};

export const useWebloomDrag = (item: ExistingDraggedItem) => {
  const [, drag] = useWebloomDragCore(item);

  const widget = editorStore.currentPage.getWidgetById(item.id);
  const dom = widget?.dom;
  useEffect(() => {
    if (dom) {
      drag(dom);
    }
    return () => {
      drag(null);
    };
  }, [drag, dom]);
};
