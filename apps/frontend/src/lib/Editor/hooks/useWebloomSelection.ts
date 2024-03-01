import { commandManager } from '@/Actions/CommandManager';
import { RefObject, useCallback, useEffect } from 'react';
import { editorStore } from '../Models';
import { SelectionAction } from '@/Actions/Editor/selection';
import { EDITOR_CONSTANTS } from '@webloom/constants';
/**
 * @description Used to select the widget on click
 * @param ref
 * @param id
 */
export const useWebloomSelection = (
  ref: RefObject<HTMLDivElement>,
  id: string,
) => {
  const select = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
        return editorStore.currentPage.clearSelectedNodes();
      }
      commandManager.executeCommand(new SelectionAction(id, false));
    },
    [id],
  );
  useEffect(() => {
    const curRef = ref?.current;
    if (curRef) {
      curRef.addEventListener('click', select);
    }
    return () => {
      if (curRef) {
        curRef.removeEventListener('click', select);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.current, select]);
};
