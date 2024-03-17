import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { Command } from '../types';

/**
 * @param shiftKey: if shift key is clicked the new selection will be added to the set
 * @default True
 */
export class SelectionAction {
  private static id: string | null = null;
  private static shiftKey: boolean | null = null;
  /**
   * @description used to handle the selection of the widget through the click event, it works around event bubbling
   * @param id
   * @param shiftKey
   * @returns
   */
  static selectThroughClick(id: string, shiftKey: boolean = false): Command {
    return {
      execute: () => {
        if (SelectionAction.id === null) {
          SelectionAction.id = id;
        }
        if (SelectionAction.shiftKey === null) {
          SelectionAction.shiftKey = shiftKey;
        }
        if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
          SelectionAction.end();
        }
      },
    };
  }

  static remoteSelect(id: string) {
    return {
      execute: () => {
        SelectionAction.id = id;
        SelectionAction.shiftKey = false;
        SelectionAction.end();
      },
    };
  }

  static end() {
    const id = SelectionAction.id!;
    const shiftKey = SelectionAction.shiftKey!;
    editorStore.currentPage.setSelectedNodeIds((prev) => {
      // remove selection
      if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
        return new Set();
        // toggle element
      } else if (shiftKey && prev.has(id!)) {
        return new Set([...prev].filter((i) => i !== id));
        // add new element to selection if it shares the same parent as the last selected element
      } else if (shiftKey && prev.size > 0) {
        const newNodeParent = editorStore.currentPage.getWidgetById(id).parent;
        const randomSelectedParent = editorStore.currentPage.getWidgetById(
          [...prev][0],
        ).parent;
        return newNodeParent === randomSelectedParent
          ? new Set([...prev, id])
          : new Set([id]);
      } else {
        return new Set([id]);
      }
    });

    SelectionAction.id = null;
    SelectionAction.shiftKey = null;
  }
}
