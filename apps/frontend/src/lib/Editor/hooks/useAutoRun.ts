import { autorun } from 'mobx';
import { useEffect } from 'react';
import { useLatest } from './useLatest';
import { editorStore } from '../Models';

export const useAutoRun = (fn: () => void, deps: any[] = []) => {
  const latestFn = useLatest(fn);
  useEffect(
    () => autorun(() => latestFn.current && latestFn.current()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, editorStore.currentPageId],
  );
};
