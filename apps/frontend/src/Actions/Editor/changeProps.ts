import store from '@/store';
import { Command } from '../types';
import { WebloomNode } from '@/lib/Editor/interface';

export class ChangePropAction implements Command {
  constructor(
    private comId: WebloomNode['id'],
    private key: string,
    private value: unknown,
  ) {}

  execute() {
    store.getState().setProp(this.comId, this.key, this.value);
    return {
      event: 'update' as const,
      data: [store.getState().tree[this.comId]],
    };
  }
}
