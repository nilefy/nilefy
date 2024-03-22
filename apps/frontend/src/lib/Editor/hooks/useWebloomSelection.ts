import { commandManager } from '@/actions/CommandManager';
import { useCallback, useEffect } from 'react';
import { editorStore } from '../Models';
import { SelectionAction } from '@/actions/Editor/selection';
/**
 * @description Used to select the widget on click
 * @param ref
 * @param id
 */
export const useWebloomSelection = (id: string) => {
  const dom = editorStore.currentPage.getWidgetById(id).dom;
  const select = useCallback(
    (e: MouseEvent) => {
      commandManager.executeCommand(
        SelectionAction.selectThroughClick(id, e.shiftKey),
      );
    },
    [id],
  );
  useEffect(() => {
    const curRef = dom;
    if (curRef) {
      curRef.addEventListener('click', select);
    }
    return () => {
      if (curRef) {
        curRef.removeEventListener('click', select);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dom, select]);
};
