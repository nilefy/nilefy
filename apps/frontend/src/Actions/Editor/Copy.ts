import { editorStore } from '@/lib/Editor/Models';
import { Command } from '../types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { WidgetSnapshot } from '@/types';

export class CopyAction implements Command {
  private clipboard: { copied: WidgetSnapshot[] };

  constructor() {
    this.clipboard = { copied: [] };
  }

  execute() {
    if (editorStore.currentPage.selectedNodeIds.size === 0) return;

    for (const node of editorStore.currentPage.selectedNodeIds) {
      const widget = editorStore.currentPage.widgets[node].snapshot;
      const copied = {
        ...widget,
        id: getNewWidgetName(widget.type),
      };
      this.clipboard.copied.push(copied);
    }

    navigator.clipboard.writeText(JSON.stringify(this.clipboard));
  }
}
