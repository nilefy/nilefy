import { WebloomNodeDimensions, getDOMInfo } from 'lib/utils';
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
    draggedNode: string | null;
    dropTarget: string | null;
}
interface WebloomActions {
    setDom: (id: string, dom: HTMLElement) => void;
    moveNode: (id: string, parentId: string, index?: number) => void;
    setDraggedNode: (id: string | null) => void;
    setDropTarget: (id: string | null) => void;
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
        dropTarget: null,
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
                state.tree[id] = {
                    ...state.tree[id],
                    ...dimensions
                };
                return state;
            });
        }
    })
);

export { store };
export default store;
