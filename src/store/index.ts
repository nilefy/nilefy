import { create } from 'zustand';
export type WebloomNode = {
  id: string;
  name: string;
  //type can be a react component or a string
  type: React.ElementType | string;
  dom: HTMLElement | null;
  nodes: string[];
  parent: string | null;
  props: Record<string, unknown>;
  isCanvas?: boolean;
};
export type WebloomTree = {
  [key: string]: WebloomNode;
};
interface WebloomState {
  tree: WebloomTree;
  draggedNode: string | null;
  dropTarget: string | null;
}
interface WebloomActions {
  setDom: (id: string, dom: HTMLElement) => void;
  moveNode: (id: string, parentId: string) => void;
  setDraggedNode: (id: string | null) => void;
  setDropTarget: (id: string | null) => void;
}

const store = create<WebloomState & WebloomActions>()((set) => ({
  tree: {},
  draggedNode: null,
  setDom: (id: string, dom: HTMLElement) => {
    set((state) => {
      state.tree[id].dom = dom;
      return state;
    });
  },
  moveNode: (id: string, parentId: string) => {
    set((state) => {
      const oldParentId = state.tree[id].parent;
      const newTree = {
        ...state.tree,
        [id]: {
          ...state.tree[id],
          parent: parentId
        },
        [parentId]: {
          ...state.tree[parentId],
          nodes: [...state.tree[parentId].nodes, id]
        }
      };
      if (oldParentId) {
        newTree[oldParentId] = {
          ...newTree[oldParentId],
          nodes: newTree[oldParentId].nodes.filter((nodeId) => nodeId !== id)
        };
      }
      console.log(newTree);
      return { tree: newTree };
    });
  },
  setDraggedNode: (id: string | null) => {
    set((state) => {
      state.draggedNode = id;
      return state;
    });
  },
  setDropTarget: (id: string | null) => {
    set((state) => {
      state.dropTarget = id;
      return state;
    });
  },
  dropTarget: null
}));

//init store

export { store };
export default store;
