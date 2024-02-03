import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, Command } from '../types';

export class CopyAction implements Command {
  private clipboard: ClipboardDataT;

  constructor() {
    this.clipboard = {
      action: 'copy',
      selected: [...editorStore.currentPage.selectedNodeIds],
      nodes: {},
    };
  }

  execute() {
    if (this.clipboard.selected.length === 0) return;

    for (const node of this.clipboard.selected) {
      this.copy(node);
    }

    navigator.clipboard.writeText(JSON.stringify(this.clipboard));
  }

  private copy(node: string) {
    const snapshot = editorStore.currentPage.widgets[node].snapshot;
    this.clipboard.nodes[node] = snapshot;
    for (const node of snapshot.nodes) {
      this.copy(node);
    }
  }
}
