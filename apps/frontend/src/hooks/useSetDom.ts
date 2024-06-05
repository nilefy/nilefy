import { useEffect, RefObject } from 'react';
// import store from '@/store';
import { editorStore } from '@/lib/Editor/Models';

// const setDom = store.getState().setDom;

export const useSetDom = (ref: RefObject<HTMLElement>, id: string) => {
  useEffect(() => {
    if (ref.current) {
      editorStore.currentPage.getWidgetById(id).setDom(ref.current);
    }
  }, [id, ref]);
};