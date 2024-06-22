import { commandManager } from '@/actions/CommandManager';
import { useCallback, useEffect, useState } from 'react';
import { editorStore } from '../Models';
import { WidgetSelection } from '@/actions/editor/selection';
import { useAutoRun } from './useAutoRun';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
/**
 * @description Used to select the widget on click
 * @param ref
 * @param id
 */
export const useWebloomSelection = (id: string) => {
  const dom = editorStore.currentPage.getWidgetById(id).dom;
  const [shouldSkip, setShouldSkip] = useState(false);

  useAutoRun(() => {
    if (
      id === EDITOR_CONSTANTS.ROOT_NODE_ID &&
      (editorStore.currentPage.isDragging || editorStore.currentPage.isResizing)
    ) {
      setShouldSkip(true);
    }
  });
  const select = useCallback(
    (e: MouseEvent) => {
      if (shouldSkip) {
        setShouldSkip(false);
        return;
      }
      commandManager.executeCommand(
        WidgetSelection.selectThroughClick(id, e.shiftKey),
      );
    },
    [id, shouldSkip],
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
