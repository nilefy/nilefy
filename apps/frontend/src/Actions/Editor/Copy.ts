import { editorStore } from '@/lib/Editor/Models';
import { Command } from '../types';
import { getNewWidgetName } from '@/lib/Editor/widgetName';

export class CopyAction implements Command {
  constructor(private nodeId: string) {}

  execute() {
    const widget = editorStore.currentPage.widgets[this.nodeId].snapshot;
    const copied = {
      ...widget,
      id: getNewWidgetName(widget.type),
      row: widget.row + 2,
      col: widget.col + 2,
    };
    editorStore.currentPage.addWidget(copied);
    return {
      event: 'insert' as const,
      data: {
        node: copied,
        sideEffects: [],
      },
    };
  }
}
