import store from '@/store';
import { Command } from '../types';
import { EDITOR_CONSTANTS } from '@/lib/Editor/constants';

/**
 * @param shiftKey: if shift key is clicked the new selection will be added to the set
 * @default True
 */
export class SelectionAction implements Command {
  constructor(
    private id: string,
    private shiftKey: boolean = true,
  ) {}

  execute(): void {
    store.getState().setSelectedNodeIds((prev) => {
      // remove selection
      if (this.id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
        return new Set();
        // toggle element
      } else if (this.shiftKey && prev.has(this.id)) {
        return new Set([...prev].filter((i) => i !== this.id));
        // add new element to selection if it shares the same parent as the last selected element
      } else if (this.shiftKey && prev.size > 0) {
        const newNodeParent = store.getState().getNode(this.id)?.parent;
        const randomSelectedParent = store.getState().getNode([...prev][0])
          ?.parent;
        return newNodeParent === randomSelectedParent
          ? new Set([...prev, this.id])
          : prev;
      } else {
        return new Set([this.id]);
      }
    });
  }
}
