import { useHotkeys } from 'react-hotkeys-hook';
import { EditorState } from '../Models/editor';
import { CommandManager } from '@/actions/CommandManager';
import { DeleteAction } from '@/actions/Editor/Delete';
import { CopyAction } from '@/actions/Editor/Copy';
import { CutAction } from '@/actions/Editor/Cut';
import { ClipboardDataT } from '@/actions/types';
import { PasteAction } from '@/actions/Editor/Paste';
import ResizeAction from '@/actions/Editor/Resize';
import { useEditorMousePosition } from './useEditorMousePosition';

export const useEditorHotKeys = (
  editorStore: EditorState,
  commandManager: CommandManager,
) => {
  const mousePos = useEditorMousePosition();
  useHotkeys('esc', () => {
    commandManager.executeCommand(ResizeAction.cancel());
  });
  useHotkeys('ctrl+z', () => {
    commandManager.undoCommand();
  });
  useHotkeys('delete', () => {
    if (editorStore.currentPage.selectedNodeIds.size > 0) {
      commandManager.executeCommand(new DeleteAction());
    }
  });

  useHotkeys(['ctrl+c', 'ctrl+x'], (_, handlers) => {
    if (editorStore.currentPage.selectedNodeIds.size === 0) return;

    if (handlers.keys?.join('') === 'c') {
      commandManager.executeCommand(new CopyAction());
    } else {
      commandManager.executeCommand(new CutAction());
    }
  });

  useHotkeys('ctrl+v', async () => {
    try {
      const data: ClipboardDataT = JSON.parse(
        await navigator.clipboard.readText(),
      );
      commandManager.executeCommand(
        new PasteAction({
          data,
          mousePos: mousePos.current,
        }),
      );
    } catch (ig) {
      console.log(ig);
    }
  });
};
