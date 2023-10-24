import { WebloomNodeDimensions, getDOMInfo } from '../lib/utils';
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
    x: number;
    y: number;
    width: number;
    height: number;
};

export type WebloomTree = {
    [key: string]: WebloomNode;
};
interface WebloomState {
    tree: WebloomTree;
}
interface WebloomActions {
    setDom: (id: string, dom: HTMLElement) => void;
    moveNode: (id: string, parentId: string, index?: number) => void;
    addNode: (node: WebloomNode, parentId: string) => void;
    setDimensions: (id: string, dimensions: WebloomNodeDimensions) => void;
}

interface WebloomGetters {
    getCanvas: (id: string) => WebloomNode | null;
    getNode: (id: string) => WebloomNode | null;
    getChildDimensions: (id: string) => WebloomNodeDimensions;
}
const store = create<WebloomState & WebloomActions & WebloomGetters>()(
    (set, get) => ({
        tree: {},
        draggedNode: null,
        setDom: (id: string, dom: HTMLElement) => {
            set((state) => {
                if (!state.tree[id]) return state;
                state.tree[id].dom = dom;
                return state;
            });
        },
        addNode: (node: WebloomNode, parentId: string) => {
            set((state) => {
                const newTree = {
                    ...state.tree,
                    [node.id]: node,
                    [parentId]: {
                        ...state.tree[parentId],
                        nodes: [...state.tree[parentId].nodes, node.id]
                    }
                };
                return { tree: newTree };
            });
        },
        moveNode: (id: string, parentId: string, index = 1) => {
            set((state) => {
                const oldParentId = state.tree[id].parent;
                if (parentId === oldParentId || id === parentId) return state;
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
                        nodes: newTree[oldParentId].nodes.filter(
                            (nodeId) => nodeId !== id
                        )
                    };
                }
                return { tree: newTree };
            });
        },

        getNode: (id: string) => {
            return get().tree[id] || null;
        },
        // return first canvas node starting from id and going up the tree until root
        getCanvas: (id: string): WebloomNode | null => {
            const node = get().getNode(id);
            if (!node) return null;
            if (node.isCanvas) return node;
            if (node.parent) {
                return get().getCanvas(node.parent);
            }
            return null;
        },
        getChildDimensions: (id: string): WebloomNodeDimensions => {
            return getDOMInfo(get().getNode(id)?.dom as HTMLElement);
        },
        setDimensions(id, dimensions) {
            set((state) => {
                const newState = {
                    ...state,
                    tree: {
                        ...state.tree,
                        [id]: {
                            ...state.tree[id],
                            ...dimensions
                        }
                    }
                };

                return newState;
            });
        }
    })
);

export { store };
export default store;
