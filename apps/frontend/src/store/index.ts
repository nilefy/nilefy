import { NUMBER_OF_COLUMNS, ROOT_NODE_ID, ROW_HEIGHT } from '@/lib/constants';
import { checkOverlap, getBoundingRect } from '@/lib/utils';
import { Point } from '@/types';
import { create } from 'zustand';
export type BoundingRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type ShadowElement = {
  x: number;
  y: number;
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
  // this propert is exclusive for canvas nodes
  columnWidth?: number;
  // number of columns this node takes
  columnsCount: number;
  // number of rows this node takes
  rowsCount: number;
};

export type WebloomNodeCompleteDimensions = WebloomNodeDimensions & {
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
  draggedNode: string | null;
  resizedNode: string | null;
  newNode: WebloomNode | null;
  newNodeTranslate: Point | null;
  mousePos: Point;
  shadowElement: ShadowElement | null;
}

type MoveNodeReturnType = {
  firstNodeOriginalDimensions?: {
    x: number;
    y: number;
    columnsCount: number;
    rowsCount: number;
  };
  changedNodesOriginalCoords: Record<string, Point>;
};
interface WebloomActions {
  setDom: (id: string, dom: HTMLElement) => void;
  setSelectedNode: (id: string | null) => void;
  setOverNode: (id: string | null) => void;
  setShadowElement: (shadowElement: ShadowElement | null) => void;
  moveNode: (id: string, parentId: string, index?: number) => void;
  removeNode: (id: string) => void;
  moveNodeIntoGrid: (
    id: string,
    newCoords: Partial<Point>,
    firstCall?: boolean,
  ) => MoveNodeReturnType;
  addNode: (node: WebloomNode, parentId: string) => void;
  setDimensions: (
    id: string,
    dimensions: Partial<WebloomNodeDimensions>,
  ) => void;
  resizeCanvas: (
    id: string,
    dimensions: Partial<WebloomNodeDimensions>,
  ) => void;
  setMousePos: (pos: WebloomState['mousePos']) => void;
  setNewNode: (newNode: WebloomState['newNode']) => void;
  setNewNodeTranslate: (translate: WebloomState['newNodeTranslate']) => void;
  setDraggedNode: (id: string | null) => void;
  setResizedNode: (id: string | null) => void;
}

interface WebloomGetters {
  getCanvas: (id: string) => WebloomNode;
  getNode: (id: string) => WebloomNode | null;
  getDimensions: (id: string) => WebloomNodeCompleteDimensions;
  getBoundingRect: (id: string) => BoundingRect;
  getGridSize: (id: string) => [GRID_ROW: number, GRID_COL: number];
}
const store = create<WebloomState & WebloomActions & WebloomGetters>()(
  (set, get) => ({
    tree: {},
    draggedNode: null,
    overNode: null,
    selectedNode: null,
    newNode: null,
    newNodeTranslate: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    resizedNode: null,
    setResizedNode(id) {
      set({ resizedNode: id });
    },
    setDraggedNode(id) {
      set({ draggedNode: id });
    },
    shadowElement: null,
    setShadowElement(shadowElement) {
      set({ shadowElement });
    },
    setSelectedNode: (id: string | null) => {
      set({ selectedNode: id });
    },
    setNewNode(newNode) {
      set({ newNode });
    },
    setNewNodeTranslate(translate) {
      set({ newNodeTranslate: translate });
    },
    setMousePos: (pos: Point) => {
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
            dom,
          },
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
            nodes: [...state.tree[parentId].nodes, node.id],
          },
        };
        return { tree: newTree };
      });
    },
    removeNode(id) {
      // cannot delete a non existing node
      if (!(id in get().tree)) return;
      set((state) => {
        const node = state.tree[id];
        if (!node) return state;
        const newTree = {
          ...state.tree,
          [node.parent!]: {
            ...state.tree[node.parent!],
            nodes: state.tree[node.parent!].nodes.filter(
              (nodeId) => nodeId !== id,
            ),
          },
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
            parent: parentId,
          },
          [parentId]: {
            ...state.tree[parentId],
            nodes: [...state.tree[parentId].nodes, id],
          },
        };
        if (oldParentId) {
          newTree[oldParentId] = {
            ...newTree[oldParentId],
            nodes: newTree[oldParentId].nodes.filter((nodeId) => nodeId !== id),
          };
        }
        return { tree: newTree };
      });
    },

    getNode: (id: string) => {
      return get().tree[id] || null;
    },
    // return first canvas node starting from id and going up the tree until root
    getCanvas: (id: string): WebloomNode => {
      if (id === ROOT_NODE_ID) return get().getNode(id)!;
      const node = get().getNode(id)!;
      const parent = get().getNode(node.parent!)!;
      if (parent.isCanvas) return parent;
      return get().getCanvas(node?.parent || ROOT_NODE_ID);
    },
    getGridSize: (id) => {
      const canvasParent = get().getCanvas(id);
      return [ROW_HEIGHT, canvasParent.columnWidth!];
    },
    //gets actual x, y coordinates of a node
    getDimensions: (id: string): WebloomNodeCompleteDimensions => {
      const node = get().getNode(id)!;
      const parent = get().getCanvas(id)!;
      if (node.id === ROOT_NODE_ID) {
        return {
          x: 0,
          y: 0,
          columnsCount: NUMBER_OF_COLUMNS,
          rowsCount: parent.rowsCount,
          columnWidth: parent.columnWidth,
          width: Math.round(parent.columnWidth! * NUMBER_OF_COLUMNS),
          height: parent.rowsCount * ROW_HEIGHT,
        };
      }
      const gridColSize = parent.columnWidth!;
      const gridRowSize = ROW_HEIGHT;
      return {
        x: node.x * gridColSize,
        y: node.y * gridRowSize,
        columnsCount: node.columnsCount,
        rowsCount: node.rowsCount,
        width: node.columnsCount * gridColSize,
        height: node.rowsCount * gridRowSize,
        columnWidth: gridColSize,
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
              ...dimensions,
            },
          },
        };
        return newState;
      });
    },
    resizeCanvas(id, dimensions) {
      const node = get().tree[id];
      const oldColumnWidth = node.columnWidth;
      const oldColumnsCount = node.columnsCount;
      if (
        node.isCanvas &&
        (dimensions.columnWidth !== oldColumnWidth ||
          dimensions.columnsCount !== oldColumnsCount)
      ) {
        let newColumnWidth = dimensions.columnWidth || oldColumnWidth;
        if (id !== ROOT_NODE_ID) {
          const [, gridcol] = get().getGridSize(id);
          const columnsCount = dimensions.columnsCount || node.columnsCount;
          newColumnWidth = (columnsCount * gridcol) / NUMBER_OF_COLUMNS;
        }
        recurse(id, {
          ...dimensions,
          columnWidth: newColumnWidth,
          columnsCount: dimensions.columnsCount || node.columnsCount,
        });
        //recurse to set the new columnWidth of all children
      } else {
        get().setDimensions(id, dimensions);
      }
      function recurse(id: string, dimensions: Partial<WebloomNodeDimensions>) {
        const node = get().tree[id];
        get().setDimensions(id, dimensions);
        const children = node.nodes;
        for (const child of children) {
          const childNode = get().tree[child];
          const newColumnWidth =
            (childNode.columnsCount * dimensions.columnWidth!) /
            NUMBER_OF_COLUMNS;
          recurse(child, { columnWidth: newColumnWidth });
        }
      }
    },
    moveNodeIntoGrid(id, newCoords, firstCall = true) {
      const changedNodesOriginalCoords: Record<string, Point> = {};
      const parent = get().tree[ROOT_NODE_ID];
      const node = get().tree[id];
      const mousePos = get().mousePos;
      const overId = get().overNode;
      newCoords.x ??= node.x;
      newCoords.y ??= node.y;
      const y = newCoords.y;
      const top = y;
      const firstNodeOriginalDimensions = {
        x: node.x,
        y: node.y,
        columnsCount: node.columnsCount,
        rowsCount: node.rowsCount,
      };
      const nodes = [...parent.nodes];
      //sort the nodes by y position (ascending) (top to bottom)
      let allowResize = true;
      nodes.sort((a, b) => -get().tree[a].y + get().tree[b].y);
      if (firstCall) {
        if (overId !== null && overId !== ROOT_NODE_ID && overId !== id) {
          const overNode = store.getState().tree[overId];
          const overNodeBoundingRect = get().getBoundingRect(overId);
          const overNodeTop = overNode.y;
          const overNodeBottom = overNode.y + overNode.rowsCount;
          if (
            mousePos.y <=
            overNodeBoundingRect.top +
              (overNodeBoundingRect.bottom - overNodeBoundingRect.top) / 2 -
              //todo fix this magic number with a proper value that's relative to the grid size
              5
          ) {
            newCoords.y = overNodeTop - 1;
          } else {
            newCoords.y = overNodeBottom;
          }
          allowResize = false;
        }
        nodes.forEach((nodeId) => {
          if (nodeId === id) return false;
          const otherNode = get().tree[nodeId];
          if (!otherNode) return false;
          const otherBottom = otherNode.y + otherNode.rowsCount;
          const otherTop = otherNode.y;
          const otherBoundingRect = get().getBoundingRect(nodeId);
          if (top < otherBottom && top > otherTop) {
            if (
              mousePos.x > otherBoundingRect.left &&
              mousePos.x < otherBoundingRect.right &&
              top < otherBottom
            ) {
              newCoords.y = otherBottom;
            }
          }
        });
      }

      function recurse(
        id: string,
        newCoords: Partial<Point>,
        firstCall = true,
      ) {
        const state = get();
        const node = state.tree[id];
        newCoords.x ??= node.x;
        newCoords.y ??= node.y;
        if (newCoords.x === node.x && newCoords.y === node.y) return;
        if (!node) return state;
        const parent = state.tree[ROOT_NODE_ID];
        const x = newCoords.x;
        const y = newCoords.y;
        let colCount = node.columnsCount;
        let rowCount = node.rowsCount;
        let left = x;
        let top = y;
        let right = x + colCount;
        const bottom = y + rowCount;
        const toBeMoved: { id: string; x?: number; y?: number }[] = [];
        const checkForOverlap =
          firstCall && allowResize
            ? nodes.filter((nodeId) => {
                if (nodeId === id) return false;
                const otherNode = state.tree[nodeId];
                if (!otherNode) return false;
                // right is redeclared here because colCount might change
                const otherBottom = otherNode.y + otherNode.rowsCount;
                const otherTop = otherNode.y;
                const otherLeft = otherNode.x;
                const otherRight = otherNode.x + otherNode.columnsCount;
                if (firstCall && top < otherBottom && top >= otherTop) {
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
                  return false;
                }
                return true;
              })
            : nodes.filter((nodeId) => {
                return nodeId !== id;
              });
        // reassign right because colCount might have changed
        right = left + colCount;
        checkForOverlap.forEach((nodeId) => {
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
                bottom,
              },
              {
                left: otherLeft,
                top: otherTop,
                right: otherRight,
                bottom: otherBottom,
              },
            )
          ) {
            toBeMoved.push({ id: nodeId, y: bottom });
          }
        });
        if (firstCall) {
          const parentLeft = parent.x;
          const parentRight = parent.x + parent.columnsCount;
          const parentTop = parent.y;
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
          if (top < parentTop) {
            top = parentTop;
            rowCount = bottom - parentTop;
          }
        }
        get().setDimensions(id, {
          x: left,
          y: top,
          columnsCount: colCount,
          rowsCount: rowCount,
        });

        toBeMoved.forEach((node) => {
          changedNodesOriginalCoords[node.id] ??= {
            x: state.tree[node.id].x,
            y: state.tree[node.id].y,
          };
        });
        toBeMoved.forEach((node) => {
          recurse(node.id, { y: node.y }, false);
        });
      }
      recurse(id, newCoords, firstCall);

      if (firstCall) {
        return {
          changedNodesOriginalCoords,
          firstNodeOriginalDimensions,
        };
      }
      return {
        changedNodesOriginalCoords: {
          ...changedNodesOriginalCoords,
          [id]: {
            x: firstNodeOriginalDimensions.x,
            y: firstNodeOriginalDimensions.y,
          },
        },
      };
    },
  }),
);

export { store };
export default store;
