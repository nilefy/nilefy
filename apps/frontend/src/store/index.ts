import { getBoundingRect } from '@/lib/utils';
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
} & WebloomNodeDimensions;
export type WebloomNodeDimensions = {
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
    overNode: string | null;
    selectedNode: string | null;
    mousePos: { x: number; y: number };
}
interface WebloomActions {
    setDom: (id: string, dom: HTMLElement) => void;
    setSelectedNode: (id: string | null) => void;
    setOverNode: (id: string | null) => void;
    moveNode: (id: string, parentId: string, index?: number) => void;
    moveNodeIntoGrid: (
        id: string,
        displacement: { x: number; y: number }
    ) => void;
    addNode: (node: WebloomNode, parentId: string) => void;
    setDimensions: (
        id: string,
        dimensions: Partial<WebloomNodeDimensions>
    ) => void;
    resizeNode: (id: string, dimensions: WebloomNodeDimensions) => void;
    setMousePos: (pos: { x: number; y: number }) => void;
}

interface WebloomGetters {
    getCanvas: (id: string) => WebloomNode | null;
    getNode: (id: string) => WebloomNode | null;
    getDimensions: (id: string) => WebloomNodeDimensions;
}
const store = create<WebloomState & WebloomActions & WebloomGetters>()(
    (set, get) => ({
        tree: {},
        draggedNode: null,
        overNode: null,
        selectedNode: null,
        mousePos: { x: 0, y: 0 },
        setSelectedNode: (id: string | null) => {
            set({ selectedNode: id });
        },
        setMousePos: (pos: { x: number; y: number }) => {
            set({ mousePos: pos });
        },
        setOverNode: (id: string | null) => {
            set({ overNode: id });
        },
        setDom: (id: string, dom: HTMLElement) => {
            set((state) => {
                if (!state.tree[id]) return state;
                const newTree = {
                    ...state.tree,
                    [id]: {
                        ...state.tree[id],
                        dom
                    }
                };
                return { tree: newTree };
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
        moveNode: (id: string, parentId: string) => {
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
        getDimensions: (id: string): WebloomNodeDimensions => {
            const node = get().getNode(id)!;
            return {
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
            };
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
        },
        resizeNode(id, dimensions) {
            const state = get();
            const node = state.tree[id];
            if (!node) return state;
            const parent = state.tree['root'];
            const {
                left,
                top,
                right,
                bottom,
                width: newWidth,
                height: newHeight
            } = getBoundingRect(dimensions);
            parent.nodes.forEach((nodeId) => {
                const otherNode = state.tree[nodeId];
                if (!otherNode) return false;
                if (otherNode.id === id) return false;
                const otherNodeDimensions = get().getDimensions(nodeId);
                const {
                    left: otherLeft,
                    top: otherTop,
                    right: otherRight,
                    bottom: otherBottom
                } = getBoundingRect(otherNodeDimensions);
                const xCollision =
                    (left >= otherLeft && left <= otherRight) ||
                    (right >= otherLeft && right <= otherRight);
                const yCollision =
                    (top >= otherTop && top <= otherBottom) ||
                    (bottom >= otherTop && bottom <= otherBottom);

                if (xCollision && yCollision) {
                    get().moveNodeIntoGrid(nodeId, {
                        x: 0,
                        y: -otherTop + bottom
                    });
                }
            });

            return get().setDimensions(id, {
                x: left,
                y: top,
                width: newWidth,
                height: newHeight
            });
        },
        moveNodeIntoGrid: (
            id: string,
            displacement: { x: number; y: number }
        ) => {
            if (displacement.x === 0 && displacement.y === 0) return;
            const state = get();
            const over = state.overNode;
            const node = state.tree[id];
            const mousePos = state.mousePos;
            if (!node) return state;
            const parent = state.tree['root'];
            const nodeDimensions = get().getDimensions(id);
            let left = nodeDimensions.x + displacement.x;
            let top = nodeDimensions.y + displacement.y;

            const right = left + nodeDimensions.width;
            const bottom = top + nodeDimensions.height;
            let newWidth = nodeDimensions.width;
            //check for collisions
            parent.nodes.forEach((nodeId) => {
                if (nodeId === id) return false;
                const otherNode = state.tree[nodeId];
                if (!otherNode) return false;
                const otherNodeDimensions = get().getDimensions(nodeId);
                const {
                    left: otherLeft,
                    top: otherTop,
                    right: otherRight,
                    bottom: otherBottom,
                    height: otherHeight
                } = getBoundingRect(otherNodeDimensions);
                const isOver = over === nodeId;
                if (isOver) {
                    if (
                        mousePos.y <=
                        otherTop + (otherBottom - otherTop) / 2 - 5
                    ) {
                        get().moveNodeIntoGrid(nodeId, {
                            x: 0,
                            y: -otherTop + bottom
                        });
                    } else {
                        top = otherBottom;
                    }
                    return true;
                }
                const xCollision =
                    (left >= otherLeft && left <= otherRight) ||
                    (right >= otherLeft && right <= otherRight);

                const yCollision =
                    (top >= otherTop && top <= otherBottom) ||
                    (bottom >= otherTop && bottom <= otherBottom);
                if (top < otherBottom && top >= otherTop) {
                    if (left < otherLeft && left + newWidth > otherLeft) {
                        newWidth = Math.min(newWidth, otherLeft - left);
                    } else if (left > otherLeft && left < otherRight) {
                        const temp = left;
                        left = otherRight;
                        newWidth += temp - left;
                    }
                }
                if (xCollision && yCollision) {
                    if (
                        top < otherTop &&
                        otherHeight >= nodeDimensions.height
                    ) {
                        get().moveNodeIntoGrid(nodeId, {
                            x: 0,
                            y: -otherTop + bottom
                        });
                    }
                }
            });

            return get().setDimensions(id, {
                x: left,
                y: top,
                width: newWidth
            });
        }
    })
);

export { store };
export default store;
