import { NUMBER_OF_COLUMNS, ROOT_NODE_ID, ROW_HEIGHT } from '@/lib/constants';
import { checkOverlap, getBoundingRect, normalize } from '@/lib/utils';
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
  parent: string;
  props: Record<string, unknown>;
  isCanvas?: boolean;
} & WebloomNodeDimensions;
export type WebloomNodeDimensions = {
  /**
   * columnNumber from left to right starting from 0 to NUMBER_OF_COLUMNS
   */
  x: number;
  /**
   * rowNumber from top to bottom starting from 0 to infinity
   */
  y: number;
  // this propert is exclusive for canvas nodes
  columnWidth?: number;
  // number of columns this node takes
  columnsCount: number;
  /**
   * number of rows this node takes
   */
  rowsCount: number;
};

export type WebloomNodeCompleteDimensions = WebloomNodeDimensions & {
  width: number;
  height: number;
};

export type WebloomTree = {
  [key: string]: WebloomNode;
};
export interface WebloomState {
  tree: WebloomTree;
  overNode: string | null;
  selectedNodeIds: Set<WebloomNode['id']>;
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
  setSelectedNodeIds: (
    callback: (
      prev: WebloomState['selectedNodeIds'],
    ) => WebloomState['selectedNodeIds'],
  ) => void;
  setOverNode: (id: string | null) => void;
  setShadowElement: (shadowElement: ShadowElement | null) => void;
  moveNode: (id: string, parentId: string) => void;
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
  /**
   * @param id
   * @param dimensions
   * @description call this to resize a canvas node to have side effects on the columnWidth of all its canvas children
   */
  resizeCanvas: (
    id: string,
    dimensions: Partial<WebloomNodeDimensions>,
  ) => void;
  /**
   *
   * @param id
   * @param dimensions
   * @returns undo information
   * @description call this to resize any node. if the new vertical size is bigger than the parent canvas node,
   * the parent canvas node will be resized to fit the new size. this is done recursively.
   */
  resize: (id: string, dimensions: Partial<WebloomNodeDimensions>) => void;
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
  getRelativeDimensions: (id: string) => WebloomNodeCompleteDimensions;
  getBoundingRect: (id: string) => BoundingRect;
  getGridSize: (id: string) => [GRID_ROW: number, GRID_COL: number];
  getDropCoordinates: (
    startPosition: Point,
    delta: Point,
    id: string,
    overId: string,
  ) => WebloomNodeDimensions;
}
/**
 *
 * @param id
 * @param overId
 * @param siblings
 * @param newDimensions
 * @param mousePos
 * @description handles where the element should be dropped when collided with a node laterally
 * @returns position the element should be in after move commit
 */
function handleLateralCollisions(
  id: string,
  overId: string,
  siblings: string[],
  newDimensions: WebloomNodeDimensions,
  mousePos: Point,
): WebloomNodeDimensions {
  const { columnsCount, rowsCount, x, y } = newDimensions;
  let left = x;
  let top = y;
  let colCount = columnsCount;
  for (const sibling of siblings) {
    if (sibling === id) continue;
    if (sibling === overId) continue;
    const otherNode = store.getState().tree[sibling];
    const otherBoundingRect = store.getState().getBoundingRect(sibling);
    const otherBottom = otherNode.y + otherNode.rowsCount;
    const otherTop = otherNode.y;
    const otherLeft = otherNode.x;
    const otherRight = otherNode.x + otherNode.columnsCount;
    if (top < otherBottom && top >= otherTop) {
      if (
        mousePos.x > otherBoundingRect.left &&
        mousePos.x < otherBoundingRect.right &&
        mousePos.y >= otherBoundingRect.bottom
      ) {
        // mouse under other element and between its left and right
        top = otherBottom;
      } else if (left < otherLeft && left + colCount > otherLeft) {
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
    }
  }
  return {
    x: left,
    y: top,
    columnsCount: colCount,
    rowsCount: rowsCount,
  };
}

function convertGridToPixel(
  dims: WebloomNodeDimensions,
  grid: [number, number],
  parentDims: Pick<WebloomNodeCompleteDimensions, 'x' | 'y'> = {
    x: 0,
    y: 0,
  },
): WebloomNodeCompleteDimensions {
  return {
    ...dims,
    x: dims.x * grid[1] + parentDims.x,
    y: dims.y * grid[0] + parentDims.y,
    width: dims.columnsCount * grid[1],
    height: dims.rowsCount * grid[0],
  };
}

function handleParentCollisions(
  parent: string,
  id: string,
  dimensions: WebloomNodeDimensions,
) {
  const [gridrow, gridcol] = store.getState().getGridSize(id);
  const parentDims = store.getState().getDimensions(parent);
  const parentBoundingRect = getBoundingRect(parentDims);
  const newPosition = convertGridToPixel(
    dimensions,
    [gridrow, gridcol],
    parentDims,
  );
  //left < parentLeft
  if (newPosition.x < parentBoundingRect.left) {
    colCount = (newPosition.x + width - parentBoundingRect.left) / gridcol;
    left = 0;
    if (colCount < 1) {
      colCount = 1;
    }
  }
  //right >= parentRight
  if (newPosition.x + width > parentBoundingRect.right) {
    // colCount = Math.min(colCount, parentRight - left);
    const diff = parentBoundingRect.right - newPosition.x;
    const newColCount = Math.floor(diff / gridcol);
    colCount = Math.min(colCount, newColCount);
    if (colCount < 1) {
      colCount = 1;
    }
  }

  //top < parentTop
  if (newPosition.y < parentBoundingRect.top) {
    top = 0;
    rowCount = (newPosition.y + height - parentBoundingRect.top) / gridrow;
  }
  //bottom >= parentBottom
  if (newPosition.y + height > parentBoundingRect.bottom) {
    const diff = parentBoundingRect.bottom - newPosition.y;
    const newRowCount = Math.floor(diff / gridrow);
    rowCount = Math.min(rowCount, newRowCount);
    if (rowCount < 1) {
      rowCount = 1;
    }
  }
}
const store = create<WebloomState & WebloomActions & WebloomGetters>()(
  (set, get) => ({
    tree: {},
    draggedNode: null,
    overNode: null,
    selectedNodeIds: new Set(),
    newNode: null,
    newNodeTranslate: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    resizedNode: null,
    setResizedNode(id) {
      set({ resizedNode: id });
    },
    getDropCoordinates(startPosition, delta, id, overId) {
      const tree = get().tree;
      const el = tree[id];
      const [gridrow, gridcol] = get().getGridSize(el.id);
      const mousePos = get().mousePos;
      const normalizedDelta = {
        x: normalize(delta.x, gridcol),
        y: normalize(delta.y, gridrow),
      };
      const newPosition = {
        x: startPosition.x + normalizedDelta.x,
        y: startPosition.y + normalizedDelta.y,
      }; // -> this is the absolute position in pixels (normalized to the grid)
      const parent = tree[el.parent!];
      const parentBoundingRect = get().getBoundingRect(el.parent!);
      const position = {
        x: newPosition.x - parentBoundingRect.left,
        y: newPosition.y - parentBoundingRect.top,
      }; // -> this is the position in pixels relative to the parent (normalized to the grid)
      // Transform the postion to grid units (columns and rows)
      const gridPosition = {
        x: Math.round(position.x / gridcol),
        y: Math.round(position.y / gridrow),
      }; // -> this is the position in grid units (columns and rows)
      let top = gridPosition.y;
      let left = gridPosition.x;
      const oldLeft = left * gridcol;
      let colCount = el.columnsCount;
      let rowCount = el.rowsCount;
      const width = el.columnsCount * gridcol;
      const height = el.rowsCount * gridrow;
      const { x, y, columnsCount, rowsCount } = handleLateralCollisions(
        id,
        overId,
        parent.nodes,
        {
          x: left,
          y: top,
          columnsCount: colCount,
          rowsCount: rowCount,
        },
        mousePos,
      );
      left = x;
      top = y;
      colCount = columnsCount;
      rowCount = rowsCount;
      newPosition.x = left * gridcol + parentBoundingRect.left;
      newPosition.y = top * gridrow + parentBoundingRect.top;

      colCount = Math.min(NUMBER_OF_COLUMNS, colCount);
      rowCount = Math.min(parent.rowsCount, rowCount);
      const overEl = tree[overId];
      const newWidth = colCount * gridcol;
      const newHeight = rowCount * gridrow;
      top = Math.round(top * gridrow) + parentBoundingRect.top;
      left = Math.round(left * gridcol) + parentBoundingRect.left;

      //todo change this when droppable areas have padding around them
      if (overEl && !overEl.isCanvas) {
        const overBoundingRect = get().getBoundingRect(overId);
        left = oldLeft;
        if (
          mousePos.y <=
          overBoundingRect.top +
            (overBoundingRect.bottom - overBoundingRect.top) / 2 -
            5
        ) {
          shadowDimensions.y = overBoundingRect.top - 10;
          shadowDimensions.height = 10;
        } else {
          shadowDimensions.y = overBoundingRect.bottom;
        }
      }
      return shadowDimensions;
    },
    setDraggedNode(id) {
      set({ draggedNode: id });
    },
    shadowElement: null,
    setShadowElement(shadowElement) {
      set({ shadowElement });
    },
    setSelectedNodeIds: (callback) => {
      set((prev) => ({ selectedNodeIds: callback(prev.selectedNodeIds) }));
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
          [node.parent]: {
            ...state.tree[node.parent],
            nodes: state.tree[node.parent].nodes.filter(
              (nodeId) => nodeId !== id,
            ),
          },
        };
        delete newTree[id];
        return { tree: newTree };
      });
    },
    moveNode(id, parentId) {
      set((state) => {
        const oldParentId = state.tree[id].parent;
        if (parentId === oldParentId || id === parentId) return state;
        const oldColCount = state.tree[id].columnsCount;
        const colWidth = state.tree[oldParentId!].columnWidth!;
        const newColWidth = state.tree[parentId].columnWidth!;
        const newColCount = Math.round((oldColCount * colWidth) / newColWidth);
        const node = state.tree[id];
        node.columnsCount = newColCount;
        const newTree = {
          ...state.tree,
          [id]: {
            ...node,
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
      const parent = get().getNode(node.parent)!;
      if (parent.isCanvas) return parent;
      return get().getCanvas(node?.parent || ROOT_NODE_ID);
    },
    getGridSize: (id) => {
      const canvasParent = get().getCanvas(id);
      return [ROW_HEIGHT, canvasParent.columnWidth!];
    },
    /**
     * gets actual x, y coordinates of a node
     */
    getDimensions(id) {
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
      const parentDimensions = get().getDimensions(node.parent);
      return convertGridToPixel(
        node,
        [gridRowSize, gridColSize],
        parentDimensions,
      );
    },
    getRelativeDimensions(id) {
      const node = get().getNode(id)!;
      if (node.id === ROOT_NODE_ID) {
        return {
          x: 0,
          y: 0,
          columnsCount: NUMBER_OF_COLUMNS,
          rowsCount: node.rowsCount,
          columnWidth: node.columnWidth,
          width: Math.round(node.columnWidth! * NUMBER_OF_COLUMNS),
          height: node.rowsCount * ROW_HEIGHT,
        };
      }
      const parent = get().getNode(node.parent)!;
      const gridColSize = parent.columnWidth!;
      const gridRowSize = ROW_HEIGHT;
      return {
        x: node.x * gridColSize,
        y: node.y * gridRowSize,
        width: node.columnsCount * gridColSize,
        height: node.rowsCount * gridRowSize,
        columnsCount: node.columnsCount,
        rowsCount: node.rowsCount,
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
    resize(id, dimensions) {},

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
      const node = get().tree[id];
      const parent = get().tree[node.parent];
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
      nodes.sort((a, b) => -get().tree[a].y + get().tree[b].y);

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
        const parent = state.tree[node.parent];
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

        const parentBoundingRect = get().getBoundingRect(parent.id);
        const parentLeft = parentBoundingRect.left;
        const parentRight = parentBoundingRect.right;
        const parentTop = parentBoundingRect.top;
        const gridcol = parent.columnWidth!;
        const gridrow = ROW_HEIGHT;
        const nodeLeft = left * gridcol + parentLeft;
        const nodeRight = nodeLeft + colCount * gridcol;
        const nodeTop = top * gridrow + parentTop;
        const nodeBottom = nodeTop + rowCount * gridrow;
        if (firstCall) {
          if (nodeRight > parentRight) {
            const diff = parentBoundingRect.right - nodeLeft;
            const newColCount = Math.floor(diff / gridcol);
            colCount = Math.min(colCount, newColCount);
            if (colCount < 1) {
              colCount = 1;
            }
          }
          if (nodeLeft < parentLeft) {
            colCount = (nodeRight - parentBoundingRect.left) / gridcol;
            left = 0;
            if (colCount < 1) {
              colCount = 1;
            }
          }
          if (nodeTop < parentTop) {
            top = 0;
            rowCount = (nodeBottom - parentBoundingRect.top) / gridrow;
          }
        }
        if (nodeBottom > parentBoundingRect.bottom) {
          // the voo-doo value is just to add pading under the expension resulted by the element
          const diff = nodeBottom - parentBoundingRect.bottom + 100;
          const newRowCount = Math.floor(diff / gridrow);
          get().resizeCanvas(parent.id, {
            rowsCount: parent.rowsCount + newRowCount,
          });
        }
        colCount = Math.min(NUMBER_OF_COLUMNS, colCount);
        if (node.isCanvas) {
          get().resizeCanvas(id, {
            columnsCount: colCount,
            rowsCount: rowCount,
            x: left,
            y: top,
          });
        } else {
          get().setDimensions(id, {
            x: left,
            y: top,
            columnsCount: colCount,
            rowsCount: rowCount,
          });
        }
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
