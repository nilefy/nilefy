import { useHotkeys } from 'react-hotkeys-hook';
import { EditorState } from '../Models/editor';
import { CommandManager } from '@/actions/CommandManager';
import { DeleteAction } from '@/actions/editor/Delete';
import { CopyAction } from '@/actions/editor/Copy';
import { CutAction } from '@/actions/editor/Cut';
import { ClipboardDataT } from '@/actions/types';
import { PasteAction } from '@/actions/editor/Paste';
import ResizeAction from '@/actions/editor/Resize';
import { useEditorMousePosition } from './useEditorMousePosition';
import { toast } from '@/components/ui/use-toast';

export const useEditorHotKeys = (
  editorStore: EditorState,
  commandManager: CommandManager,
) => {
  const mousePos = useEditorMousePosition();
  useHotkeys('esc', () => {
    commandManager.executeCommand(ResizeAction.cancel());
    editorStore.currentPage.setSelectedNodeIds(new Set());
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
      toast({
        description: `Copied ${
          editorStore.currentPage.selectedNodeIds.size == 1
            ? `${[...editorStore.currentPage.selectedNodeIds][0]}`
            : `${editorStore.currentPage.selectedNodeIds.size} Components`
        } ✅ `,
      });
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
