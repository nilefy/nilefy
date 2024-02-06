import { editorStore } from '@/lib/Editor/Models';
import { RemoteTypes, UndoableCommand } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { toJS } from 'mobx';

/**
 * @NOTE: the default behaviour: the action will delete current selected widgets
 */
export class DeleteAction implements UndoableCommand {
  /**
   * stack of nodes to be deleted,
   * enter children then parents
   */
  private nodes: WebloomWidget['snapshot'][];
  private toDelete: string[] | undefined = [];
  private selected: boolean = true;

  constructor(nodes?: string[]) {
    this.nodes = [];
    if (nodes) {
      this.toDelete = nodes;
      this.selected = false;
    }
  }

  execute(): RemoteTypes {
    if (!this.selected) {
      return {
        event: 'delete' as const,
        data: this.toDelete!,
      };
    }

    // those ids are in the same tree levels
    const selectedIds = toJS(editorStore.currentPage.selectedNodeIds);
    editorStore.currentPage.setSelectedNodeIds(new Set());

    for (const id of selectedIds) {
      this.nodes = [
        ...this.nodes,
        ...editorStore.currentPage.removeWidget(id, true),
      ];
    }
    return {
      event: 'delete' as const,
      data: {
        nodesId: [...selectedIds],
        sideEffects: [],
      },
    };
  }

  undo(): RemoteTypes {
    // server don't understand stack concept and needs the data in the correct order or the database will throw error(in other words cannot send the children before the parent)
    const serverData: WebloomWidget['snapshot'][] = [];
    while (this.nodes.length > 0) {
      const node = this.nodes.pop();
      if (!node) {
        break;
      }
      editorStore.currentPage.addWidget(node);
      serverData.push(editorStore.currentPage.getWidgetById(node.id).snapshot);
    }
    return {
      event: 'insert',
      data: {
        nodes: serverData,
        sideEffects: [],
      },
    };
  }
}
