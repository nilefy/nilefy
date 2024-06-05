import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { Command } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

export class ChangePropAction implements Command {
  constructor(private comId: WebloomWidget['id']) {}

  execute() {
    return {
      event: SOCKET_EVENTS_REQUEST.UPDATE_NODE,
      data: {
        updates: [editorStore.currentPage.getWidgetById(this.comId).snapshot],
      },
    };
  }
}
