import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { Command } from '../types';

/**
 * @param shiftKey: if shift key is clicked the new selection will be added to the set
 * @default True
 */
export class WidgetSelection {
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
        if (WidgetSelection.id === null) {
          WidgetSelection.id = id;
        }
        if (WidgetSelection.shiftKey === null) {
          WidgetSelection.shiftKey = shiftKey;
        }
        // this will eventually get hit, because the click event will bubble up to the root node
        if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
          WidgetSelection.end();
        }
      },
    };
  }

  static remoteSelect(id: string) {
    return {
      execute: () => {
        WidgetSelection.id = id;
        WidgetSelection.shiftKey = false;
        WidgetSelection.end();
      },
    };
  }

  static end() {
    const id = WidgetSelection.id!;
    const shiftKey = WidgetSelection.shiftKey!;
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

    WidgetSelection.id = null;
    WidgetSelection.shiftKey = null;
  }
}
