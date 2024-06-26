import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, Command } from '../types';
import { commandManager } from '../CommandManager';
import { DeleteAction } from './Delete';

export class CutAction implements Command {
  private clipboard: ClipboardDataT;

  constructor() {
    this.clipboard = {
      action: 'cut',
      selected: [],
      nodes: new Map(),
    };

    for (const node of editorStore.currentPage.selectedNodeIds) {
      const boundingRect =
        editorStore.currentPage.getWidgetById(node).boundingRect;
      this.clipboard.selected.push({ id: node, boundingRect });
    }
  }

  execute() {
    const text = window.getSelection()?.toString();
    if (text) return;

    if (this.clipboard.selected.length === 0) return;

    for (const node of this.clipboard.selected) {
      this.cut(node.id);
    }

    commandManager.executeCommand(new DeleteAction());
    navigator.clipboard.writeText(
      JSON.stringify({
        ...this.clipboard,
        nodes: Array.from(this.clipboard.nodes.entries()),
      }),
    );
  }

  private cut(node: string) {
    const snapshot = editorStore.currentPage.widgets[node].snapshot;
    this.clipboard.nodes.set(node, snapshot);
    for (const node of snapshot.nodes) {
      this.cut(node);
    }
  }
}
