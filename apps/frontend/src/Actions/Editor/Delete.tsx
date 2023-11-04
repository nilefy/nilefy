import store, { WebloomNode } from '@/store';
import { UndoableCommand } from '../types';
import { ROOT_NODE_ID } from '@/lib/constants';

const { removeNode, addNode, getNode } = store.getState();

export class DeleteAction implements UndoableCommand {
  private node!: WebloomNode;

  constructor(private id: string) {}

  execute(): void {
    const temp = getNode(this.id);
    if (!temp) return;
    this.node = temp;
    removeNode(this.id);
  }

  undo(): void {
    addNode(this.node, this.node.parent ?? ROOT_NODE_ID);
  }
}
