import { useHotkeys } from 'react-hotkeys-hook';
import { EditorState } from '../Models/editor';
import { CommandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { CopyAction } from '@/Actions/Editor/Copy';
import { CutAction } from '@/Actions/Editor/Cut';
import { ClipboardDataT } from '@/Actions/types';
import { PasteAction } from '@/Actions/Editor/Paste';
import ResizeAction from '@/Actions/Editor/Resize';
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

  useHotkeys('ctrl+a', (e) => {
    e.preventDefault();
    editorStore.currentPage.selectAll();
  });
};
