import { NUMBER_OF_COLUMNS, ROW_HEIGHT } from '@/lib/constants';
import { getBoundingRect } from '@/lib/utils';
import { create } from 'zustand';
export type BoundingRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};
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
    //columnNumber from left to right starting from 0 to NUMBER_OF_COLUMNS
    x: number;
    //rowNumber from top to bottom starting from 0 to infinity
    y: number;
    width: number;
    // number of columns this node takes
    columnsCount: number;
    // number of rows this node takes
    rowsCount: number;
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
    removeNode: (id: string) => void;
    moveNodeIntoGrid: (
        id: string,
        displacement: { x: number; y: number }
    ) => void;
    addNode: (node: WebloomNode, parentId: string) => void;
    setDimensions: (
        id: string,
        dimensions: Partial<WebloomNodeDimensions>
    ) => void;
    resizeNode: (
        id: string,
        dimensions: Partial<WebloomNodeDimensions>
    ) => void;
    setMousePos: (pos: { x: number; y: number }) => void;
}
function checkOverlap(
    a: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    },
    b: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }
): boolean {
    return (
        a.left < b.right &&
        b.left < a.right &&
        a.top < b.bottom &&
        b.top < a.bottom
    );
}

interface WebloomGetters {
    getCanvas: (id: string) => WebloomNode | null;
    getNode: (id: string) => WebloomNode | null;
    getDimensions: (id: string) => WebloomNodeDimensions;
    getBoundingRect: (id: string) => BoundingRect;
    getGridSize: (id: string) => [GRID_ROW: number, GRID_COL: number];
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
        removeNode(id) {
            set((state) => {
                const node = state.tree[id];
                if (!node) return state;
                const newTree = {
                    ...state.tree,
                    [node.parent!]: {
                        ...state.tree[node.parent!],
                        nodes: state.tree[node.parent!].nodes.filter(
                            (nodeId) => nodeId !== id
                        )
                    }
                };
                delete newTree[id];
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
        getGridSize: (id) => {
            const canvasParent = get().getCanvas(id)!;
            return [ROW_HEIGHT, canvasParent.width / NUMBER_OF_COLUMNS];
        },
        //gets actual x, y coordinates of a node
        getDimensions: (id: string): WebloomNodeDimensions => {
            const node = get().getNode(id)!;
            const parent = get().getCanvas(id)!;
            if (node === parent) {
                // this is the root node
                return {
                    x: 0,
                    y: 0,
                    columnsCount: NUMBER_OF_COLUMNS,
                    width: parent.width,
                    height: parent.height,
                    rowsCount: Infinity
                };
            }
            const gridColSize = parent.width / NUMBER_OF_COLUMNS;
            const gridRowSize = ROW_HEIGHT;
            return {
                x: node.x * gridColSize,
                y: node.y * gridRowSize,
                columnsCount: node.columnsCount,
                rowsCount: node.rowsCount,
                width: node.columnsCount * gridColSize,
                height: node.rowsCount * gridRowSize
            };
        },
        getBoundingRect: (id: string): BoundingRect => {
            return getBoundingRect(get().getDimensions(id));
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
            const left = dimensions.x || node.x;
            const top = dimensions.y || node.y;
            const rowCount = dimensions.rowsCount || node.rowsCount;
            const colCount = dimensions.columnsCount || node.columnsCount;
            const right = left + colCount;
            const bottom = top + rowCount;
            const parent = state.tree[node.parent!];
            parent.nodes.forEach((nodeId) => {
                if (nodeId === id) return false;
                const otherNode = state.tree[nodeId];
                if (!otherNode) return false;
                const otherBottom = otherNode.y + otherNode.rowsCount;
                const otherTop = otherNode.y;
                const otherLeft = otherNode.x;
                const otherRight = otherNode.x + otherNode.columnsCount;
                if (
                    checkOverlap(
                        {
                            left,
                            top,
                            right,
                            bottom
                        },
                        {
                            left: otherLeft,
                            top: otherTop,
                            right: otherRight,
                            bottom: otherBottom
                        }
                    )
                ) {
                    get().moveNodeIntoGrid(nodeId, {
                        x: 0,
                        y: -otherTop + bottom
                    });
                }
            });
            return get().setDimensions(id, {
                ...dimensions
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

            const x = node.x + displacement.x;
            const y = node.y + displacement.y;
            let colCount = node.columnsCount;
            const rowCount = node.rowsCount;
            let left = x;
            let top = y;
            const right = x + colCount;
            const bottom = y + rowCount;
            //check for collisions
            const toBeMoved: { id: string; x: number; y: number }[] = [];
            parent.nodes.forEach((nodeId) => {
                if (nodeId === id) return false;
                const otherNode = state.tree[nodeId];
                if (!otherNode) return false;
                const otherNodeBoundingRect = get().getBoundingRect(nodeId);
                const otherBottom = otherNode.y + otherNode.rowsCount;
                const otherTop = otherNode.y;
                const otherLeft = otherNode.x;
                const otherRight = otherNode.x + otherNode.columnsCount;
                const isOver = over === nodeId;
                if (isOver) {
                    if (
                        mousePos.y <=
                        otherNodeBoundingRect.top +
                            (otherNodeBoundingRect.bottom -
                                otherNodeBoundingRect.top) /
                                2 -
                            //todo: 5 is a threshold, replace with a proper value depending on the current gridsize
                            5
                    ) {
                        top = otherTop;
                        toBeMoved.push({ id: nodeId, x: 0, y: rowCount });
                    } else {
                        top = otherBottom;
                    }
                    return true;
                }
                if (top < otherBottom && top >= otherTop) {
                    if (left < otherLeft && left + colCount > otherLeft) {
                        colCount = Math.min(colCount, otherLeft - left);
                        if (colCount < 2) {
                            left = otherLeft - 2;
                            colCount = 2;
                        }
                    } else if (left >= otherLeft && left < otherRight) {
                        const temp = left;
                        left = otherRight;
                        colCount += temp - left;
                        if (colCount < 2) {
                            colCount = 2;
                        }
                    }
                } else if (
                    checkOverlap(
                        {
                            left,
                            top,
                            right,
                            bottom
                        },
                        {
                            left: otherLeft,
                            top: otherTop,
                            right: otherRight,
                            bottom: otherBottom
                        }
                    )
                ) {
                    toBeMoved.push({ id: nodeId, x: 0, y: -otherTop + bottom });
                }
            });
            const parentLeft = parent.x;
            const parentRight = parent.x + parent.columnsCount;
            if (right > parentRight) {
                colCount = Math.min(colCount, parentRight - left);
                if (colCount < 1) {
                    colCount = 1;
                }
            }
            if (left < parentLeft) {
                colCount = right - parentLeft;
                left = parentLeft;
                if (colCount < 1) {
                    colCount = 1;
                }
            }
            get().setDimensions(id, {
                x: left,
                y: top,
                columnsCount: colCount,
                rowsCount: rowCount
            });
            toBeMoved.forEach((node) => {
                get().moveNodeIntoGrid(node.id, { x: node.x, y: node.y });
            });
        }
    })
);

export { store };
export default store;
