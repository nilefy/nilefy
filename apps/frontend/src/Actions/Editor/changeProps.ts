import store from '@/store';
import { Command } from '../types';
import { WebloomNode } from '@/lib/Editor/interface';

export class ChangePropAction<T extends boolean> implements Command {
  constructor(
    private comId: WebloomNode['id'],
    private updateMeta: T,
    private key: T extends true ? keyof WebloomNode : string,
    private value: unknown,
  ) {}

  execute() {
    if (this.updateMeta === true) {
      store
        .getState()
        .setWidgetMeta(this.comId, this.key as keyof WebloomNode, this.value);
    } else {
      store.getState().setProp(this.comId, this.key, this.value);
    }
    return {
      event: 'update' as const,
      data: [store.getState().tree[this.comId]],
    };
  }
}
