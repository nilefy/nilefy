import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { Command } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';

export class ChangePropAction implements Command {
  constructor(private comId: WebloomWidget['id']) {}

  execute() {
    const widget = editorStore.currentPage.getWidgetById(this.comId);
    return {
      event: 'update' as const,
      data: [
        {
          ...widget.snapshot,
          name: widget.widgetName,
        },
      ],
    };
  }
}
