import { useEffect, RefObject } from 'react';
import { editorStore } from '@/lib/Editor/Models';
/**
 * @description This hook sets the dom of the widget in the store, this is useful because we can get the bounding client rect of the dom and use it for calculations
 * @param ref
 * @param id
 */
export const useSetDom = (ref: RefObject<HTMLElement>, id: string) => {
  useEffect(() => {
    if (ref.current) {
      editorStore.currentPage.getWidgetById(id).setDom(ref.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ref, ref.current]);
};
