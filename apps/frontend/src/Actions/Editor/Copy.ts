import { editorStore } from '@/lib/Editor/Models';
import { ClipboardDataT, Command } from '../types';

export class CopyAction implements Command {
  private clipboard: ClipboardDataT;

  constructor() {
    this.clipboard = {
      action: 'copy',
      nodes: [],
    };
  }

  execute() {
    if (editorStore.currentPage.selectedNodeIds.size === 0) return;

    for (const node of editorStore.currentPage.selectedNodeIds) {
      const widget = editorStore.currentPage.widgets[node].snapshot;
      this.clipboard.nodes.push(widget);
    }

    navigator.clipboard.writeText(JSON.stringify(this.clipboard));
  }
}
