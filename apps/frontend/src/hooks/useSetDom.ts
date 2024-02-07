import { useEffect, RefObject } from 'react';
import { editorStore } from '@/lib/Editor/Models';

export const useSetDom = (ref: RefObject<HTMLElement>, id: string) => {
  useEffect(() => {
    if (ref.current) {
      editorStore.currentPage.getWidgetById(id).setDom(ref.current);
    }
  }, [id, ref]);
};
