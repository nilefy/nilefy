import store, { WebloomNode } from '@/store';
import { Command, UndoableCommand } from '../types';
import { ROOT_NODE_ID } from '@/lib/constants';

const { removeNode,addNode, getNode} = store.getState();

class DeleteAction {
   
  private static id: string;
  private static  parentId :string | null;
  
  public static Delete(
    id: string,
    parentId:string|null,
    node:WebloomNode|null
  ): UndoableCommand {
    return {
      execute: () => {
        removeNode(id)
      },
      undo: () => {
        addNode(node!,parentId!);
      }
    };
  }
}
export default DeleteAction;