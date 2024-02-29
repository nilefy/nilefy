import { commandManager } from '@/Actions/CommandManager';
import { RefObject, useCallback, useEffect } from 'react';
import { editorStore } from '../Models';
import { SelectionAction } from '@/Actions/Editor/selection';

export const useInitSelection = (
  ref: RefObject<HTMLDivElement>,
  id: string | null,
) => {
  const select = useCallback(
    (e: MouseEvent) => {
      if (id === null) {
        return editorStore.currentPage.clearSelectedNodes();
      }
      // stop the event from bubbling up so the parent element doesn't get selected as well
      e.stopPropagation();
      commandManager.executeCommand(new SelectionAction(id, false));
    },
    [id],
  );
  useEffect(() => {
    const curRef = ref.current;
    if (curRef) {
      curRef.addEventListener('mousedown', select);
    }
    return () => {
      if (curRef) {
        curRef.removeEventListener('mousedown', select);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, select]);
};
