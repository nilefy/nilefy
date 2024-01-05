import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { UndoableCommand } from '../types';
// import { EDITOR_CONSTANTS } from '@webloom/constants';
// import { WebloomNode } from '@/lib/Editor/interface';
import { WebloomWidget } from '@/lib/Editor/Models/widget';

// const { removeNode, addNode, setSelectedNodeIds, getSelectedNodeIds } =
//   store.getState();

export class DeleteAction implements UndoableCommand {
  /**
   * stack of nodes to be deleted,
   * enter children then parents
   */
  private nodes: WebloomWidget['snapshot'][];

  constructor() {
    this.nodes = [];
  }

  execute() {
    // those ids are in the same tree levels
    const selectedIds = editorStore.currentPage.selectedNodeIds;
    // const selectedIds = getSelectedNodeIds();
    editorStore.currentPage.setSelectedNodeIds(new Set());
    // setSelectedNodeIds(() => new Set());

    for (const id of selectedIds) {
      this.nodes = [...this.nodes, ...editorStore.currentPage.removeWidget(id)];
    }

    // for (const id of selectedIds) {
    //   this.nodes = [...this.nodes, ...removeNode(id)];
    // }
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
      editorStore.currentPage.addWidget({
        ...node,
      });
      // addNode(node, node.parent ?? EDITOR_CONSTANTS.ROOT_NODE_ID);
    }
  }
}
