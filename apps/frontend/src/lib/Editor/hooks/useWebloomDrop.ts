import { useDragDropManager, useDrop } from 'react-dnd';
import { DraggedItem } from '../dnd/interface';
import { handleDrop, handleHover } from '../dnd/handlers';
import { editorStore } from '../Models';
import { useCallback, useEffect } from 'react';
import { useThrottle } from './useThrottle';

export const useWebloomDrop = (id: string) => {
  const [{ handlerId }, drop] = useDrop(() => ({
    accept: 'WIDGET',
    hover(item, monitor) {
      handleHover(item as DraggedItem, monitor, id);
    },
    drop(item, monitor) {
      handleDrop(item as DraggedItem, monitor);
    },
    canDrop() {
      if (editorStore.currentPage.isResizing) return false;
      return true;
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
  }));
  const hoverAction = useDragDropManager().getActions().hover;
  const hoverActionScrollHandler = useCallback(() => {
    if (handlerId && editorStore.currentPage.isDragging) {
      hoverAction([handlerId]);
    }
  }, [handlerId, hoverAction]);
  const throttledHoverActionScrollHandler = useThrottle(
    hoverActionScrollHandler,
    25,
  );
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
  const scrollContainer = widget?.scrollableContainer;
  useEffect(() => {
    if (!scrollContainer) return;
    scrollContainer.addEventListener(
      'scroll',
      throttledHoverActionScrollHandler,
    );
    return () => {
      scrollContainer.removeEventListener(
        'scroll',
        throttledHoverActionScrollHandler,
      );
    };
  }, [scrollContainer, throttledHoverActionScrollHandler]);
};
