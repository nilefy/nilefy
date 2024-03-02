import { useEffect } from 'react';
import { editorStore } from '../Models';

export const useWebloomHover = (id: string) => {
  const dom = editorStore.currentPage.getWidgetById(id).dom;
  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      e.stopPropagation();
      editorStore.currentPage.setHoveredWidgetId(id);
    };

    const current = dom;
    if (current) {
      current.addEventListener('mouseover', onMouseOver);
    }
    return () => {
      if (current) {
        current.removeEventListener('mouseover', onMouseOver);
      }
    };
  }, [dom, id]);
};
