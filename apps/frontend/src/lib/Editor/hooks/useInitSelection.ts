import { commandManager } from '@/Actions/CommandManager';
import { RefObject, useCallback, useEffect } from 'react';
import { editorStore } from '../Models';
import { SelectionAction } from '@/Actions/Editor/selection';

export const useInitSelection = (
  ref: RefObject<HTMLDivElement>,
  id: string | null,
) => {
  const select = useCallback(() => {
    if (id === null) {
      return editorStore.currentPage.clearSelectedNodes();
    }

    commandManager.executeCommand(new SelectionAction(id, false));
  }, [id]);
  useEffect(() => {
    const curRef = ref.current;
    if (curRef) {
      curRef.addEventListener('mousedown', select, true);
    }
    return () => {
      if (curRef) {
        curRef.removeEventListener('mousedown', select, true);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, select]);
};
