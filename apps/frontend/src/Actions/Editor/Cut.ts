import { editorStore } from '@/lib/Editor/Models';
import { UndoableCommand } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { toJS } from 'mobx';

export class CutAction implements UndoableCommand {
  private nodes: WebloomWidget['snapshot'][];

  constructor() {
    this.nodes = [];
  }

  execute() {
    const selectedIds = toJS(editorStore.currentPage.selectedNodeIds);
    editorStore.currentPage.setSelectedNodeIds(new Set());

    for (const id of selectedIds) {
      this.nodes = [...this.nodes, ...editorStore.currentPage.removeWidget(id)];
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
      editorStore.currentPage.addWidget(node);
    }
  }
}
