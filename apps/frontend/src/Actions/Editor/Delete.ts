import store from '@/store';
import { UndoableCommand } from '../types';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { WebloomNode } from '@/lib/Editor/interface';

const { removeNode, addNode, setSelectedNodeIds, getSelectedNodeIds } =
  store.getState();

export class DeleteAction implements UndoableCommand {
  /**
   * stack of nodes to be deleted,
   * enter children then parents
   */
  private nodes: WebloomNode[];

  constructor() {
    this.nodes = [];
  }

  execute() {
    // those ids are in the same tree levels
    const selectedIds = getSelectedNodeIds();
    setSelectedNodeIds(() => new Set());
    for (const id of selectedIds) {
      this.nodes = [...this.nodes, ...removeNode(id)];
    }
    return {
      event: 'delete' as const,
      data: [...selectedIds],
    };
  }

  undo(): void {
    while (this.nodes.length > 0) {
      const node = this.nodes.pop();
      if (!node) {
        break;
      }
      addNode(node, node.parent ?? EDITOR_CONSTANTS.ROOT_NODE_ID);
    }
  }
}
