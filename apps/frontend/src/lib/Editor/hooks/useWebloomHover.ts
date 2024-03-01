import { RefObject, useEffect } from 'react';
import { editorStore } from '../Models';

export const useWebloomHover = (ref: RefObject<HTMLDivElement>, id: string) => {
  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      e.stopPropagation();
      editorStore.currentPage.setHoveredWidgetId(id);
    };

    const current = ref.current;
    if (current) {
      current.addEventListener('mouseover', onMouseOver);
    }
    return () => {
      if (current) {
        current.removeEventListener('mouseover', onMouseOver);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ref.current, id]);
};
