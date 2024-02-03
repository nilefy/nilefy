import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, Command } from '../types';
import { commandManager } from '../CommandManager';
import { DeleteAction } from './Delete';

export class CutAction implements Command {
  private clipboard: ClipboardDataT;

  constructor() {
    this.clipboard = {
      action: 'cut',
      selected: [...editorStore.currentPage.selectedNodeIds],
      nodes: {},
    };
  }

  execute() {
    if (this.clipboard.selected.length === 0) return;

    for (const node of this.clipboard.selected) {
      this.cut(node);
    }

    commandManager.executeCommand(new DeleteAction());
    navigator.clipboard.writeText(JSON.stringify(this.clipboard));
  }

  private cut(node: string) {
    const snapshot = editorStore.currentPage.widgets[node].snapshot;
    this.clipboard.nodes[node] = snapshot;
    for (const node of snapshot.nodes) {
      this.cut(node);
    }
  }
}
