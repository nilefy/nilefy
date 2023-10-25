import { useEffect, RefObject } from 'react';
import store from '@/store';

const setDom = store.getState().setDom;

export const useSetDom = (ref: RefObject<HTMLElement>, id: string) => {
  useEffect(() => {
    if (ref.current) {
      setDom(id, ref.current);
    }
  }, [id, ref]);
};
