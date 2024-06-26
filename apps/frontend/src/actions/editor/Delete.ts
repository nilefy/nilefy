import { editorStore } from '@/lib/Editor/Models';
import { RemoteTypes, UndoableCommand } from '../types';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { toJS } from 'mobx';
import { updateOrderMap } from '@/lib/Editor/entitiesNameSeed';
import ResizeAction from './Resize';
import { commandManager } from '../CommandManager';
import { SOCKET_EVENTS_REQUEST } from '@nilefy/constants';

/**
 * @NOTE: the default behaviour: the action will delete current selected widgets
 */
export class DeleteAction implements UndoableCommand {
  /**
   * stack of nodes to be deleted,
   * enter children then parents
   */
  private nodes: WebloomWidget['snapshot'][];
  private providedNodes: string[];
  constructor(...providedNodes: string[]) {
    this.providedNodes = providedNodes;
    this.nodes = [];
  }

  execute(): RemoteTypes {
    // those ids are in the same tree levels
    let targetNodes: string[] = [];
    if (this.providedNodes.length > 0) {
      targetNodes = [...this.providedNodes];
    } else {
      targetNodes = Array.from(toJS(editorStore.currentPage.selectedNodeIds));
      editorStore.currentPage.setSelectedNodeIds(new Set());
    }
    editorStore.currentPage.setResizedWidgetId(null);
    commandManager.executeCommand(ResizeAction.cancel());
    for (const id of targetNodes) {
      this.nodes = [
        ...this.nodes,
        ...editorStore.currentPage.removeWidget(id, true),
      ];
    }
    updateOrderMap(
      [...this.nodes].map((node) => {
        return {
          type: node.type,
          name: node.id,
          pageId: node.pageId,
        };
      }),
      true,
    );
    return {
      event: 'deleteNode',
      data: {
        nodesId: [...targetNodes],
        sideEffects: [],
      },
    };
  }

  undo(): RemoteTypes {
    // server don't understand stack concept and needs the data in the correct order or the database will throw error(in other words cannot send the children before the parent)
    const serverData: WebloomWidget['snapshot'][] = [];
    updateOrderMap(
      [...this.nodes].map((node) => {
        return {
          type: node.type,
          name: node.id,
          pageId: node.pageId,
        };
      }),
      false,
    );
    while (this.nodes.length > 0) {
      const node = this.nodes.pop();
      if (!node) {
        break;
      }
      editorStore.currentPage.addWidget(node);
      serverData.push(editorStore.currentPage.getWidgetById(node.id).snapshot);
    }
    return {
      event: SOCKET_EVENTS_REQUEST.CREATE_NODE,
      data: {
        nodes: serverData,
        sideEffects: [],
      },
    };
  }
}
