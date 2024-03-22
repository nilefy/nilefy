import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { Command } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';

export class ChangePropAction implements Command {
  constructor(private comId: WebloomWidget['id']) {}

  execute() {
    return {
      event: 'update' as const,
      data: [editorStore.currentPage.getWidgetById(this.comId).snapshot],
    };
  }
}
