import { editorStore } from '@/lib/Editor/Models';
import { Command } from '../types';
import { WidgetSnapshot } from '@/types';
import { commandManager } from '../CommandManager';
import { DeleteAction } from './Delete';

export class CutAction implements Command {
  private clipboard: { clipped: WidgetSnapshot[] };

  constructor() {
    this.clipboard = { clipped: [] };
  }

  execute() {
    if (editorStore.currentPage.selectedNodeIds.size === 0) return;

    for (const node of editorStore.currentPage.selectedNodeIds) {
      const widget = editorStore.currentPage.widgets[node].snapshot;
      this.clipboard.clipped.push(widget);
    }

    commandManager.executeCommand(new DeleteAction());
    navigator.clipboard.writeText(JSON.stringify(this.clipboard));
  }
}
