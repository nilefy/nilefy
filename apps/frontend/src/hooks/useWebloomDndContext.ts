import store from '@/store';
import { useDndContext } from '@dnd-kit/core';
export function useWebloomDndContext() {
  const context = useDndContext();
  const activeData = context.active?.data;
  const isNew = activeData?.current?.isNew;
  const mousePos = store.getState().mousePos;
  const initial = context.active?.rect.current.initial || { left: 0, top: 0 };
  const translated = context.active?.rect.current.translated || {
    left: 0,
    top: 0,
  };
  const dragOperation = store.getState().dragOperation;
  const delta =
    isNew && dragOperation
      ? {
          x: dragOperation?.current.x - dragOperation?.start.x,
          y: dragOperation?.current.y - dragOperation?.start.y,
        }
      : {
          x: translated.left - initial.left,
          y: translated.top - initial.top,
        };
  return {
    ...context,
    newNode: !!isNew,
    mousePosition: mousePos,
    isDragging: !!dragOperation,
    delta: delta,
  };
}
