import { EDITOR_CONSTANTS } from '@/lib/Editor/constants';
import {
  BoundingRect,
  ShadowElement,
  WebloomGridDimensions,
  WebloomNode,
  WebloomPixelDimensions,
} from '@/lib/Editor/interface';
import { checkOverlap, getBoundingRect, normalize } from '@/lib/Editor/utils';
import { Point } from '@/types';
import { create } from 'zustand';

export type WebloomTree = {
  [key: string]: WebloomNode;
};

export type AutoCompleteItem = {
  name: string;
  id: string;
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
  editorWidth: number;
  editorHeight: number;
}

type MoveNodeReturnType = Record<string, WebloomGridDimensions>;

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
  removeNode: (id: string, recursive?: boolean) => WebloomNode[];
  moveNodeIntoGrid: (
    id: string,
    newCoords: Partial<WebloomGridDimensions>,
  ) => MoveNodeReturnType;
  addNode: (node: WebloomNode, parentId: string) => void;
  setDimensions: (
    id: string,
    dimensions: Partial<WebloomGridDimensions>,
  ) => void;
  /**
   * @param id
   * @param dimensions
   * @description call this to resize a canvas node to have side effects on the columnWidth of all its canvas children
   */
  resizeCanvas: (
    id: string,
    dimensions: Partial<WebloomGridDimensions>,
  ) => void;
  /**
   *
   * @param id
   * @param dimensions
   * @returns undo information
   * @description call this to resize any node. if the new vertical size is bigger than the parent canvas node,
   * the parent canvas node will be resized to fit the new size. this is done recursively.
   */
  resize: (id: string, dimensions: Partial<WebloomGridDimensions>) => void;
  setMousePos: (pos: WebloomState['mousePos']) => void;
  setNewNode: (newNode: WebloomState['newNode']) => void;
  setNewNodeTranslate: (translate: WebloomState['newNodeTranslate']) => void;
  setDraggedNode: (id: string | null) => void;
  setResizedNode: (id: string | null) => void;
  setProp: (id: string, key: string, value: unknown) => void;
  setProps: (id: string, newProps: Partial<WebloomNode['props']>) => void;
  setWidgetMeta<T extends keyof WebloomNode>(
    id: string,
    metaKey: T,
    value: unknown,
  ): void;
  setEditorDimensions: (dims: { width?: number; height?: number }) => void;
}

interface WebloomGetters {
  getCanvas: (id: string) => WebloomNode;
  getNode: (id: string) => WebloomNode | null;
  getGridDimensions: (id: string) => WebloomGridDimensions;
  getPixelDimensions: (id: string) => WebloomPixelDimensions;
  getRelativePixelDimensions: (id: string) => WebloomPixelDimensions;
  getBoundingRect: (id: string) => BoundingRect;
  getGridSize: (id: string) => [GRID_ROW: number, GRID_COL: number];
  getDropCoordinates: (
    startPosition: Point,
    delta: Point,
    id: string,
    overId: string,
    forShadow?: boolean,
  ) => WebloomGridDimensions;
  getSelectedNodeIds: () => WebloomState['selectedNodeIds'];
}

function handleHoverCollision(
  dimensions: WebloomGridDimensions,
  parentPixelDims: WebloomPixelDimensions,
  overBoundingRect: BoundingRect,
  grid: [number, number],
  isCanvas: boolean,
  mousePos: Point,
  forShadow = false,
): WebloomGridDimensions {
  const nodePixelDims = convertGridToPixel(dimensions, grid, parentPixelDims);
  if (!isCanvas) {
    if (
      mousePos.y <=
      overBoundingRect.top +
        (overBoundingRect.bottom - overBoundingRect.top) / 2 -
        5
    ) {
      if (forShadow) {
        nodePixelDims.y = overBoundingRect.top - 10;
        nodePixelDims.height = 10;
      } else {
        nodePixelDims.y = overBoundingRect.top;
      }
    } else {
      nodePixelDims.y = overBoundingRect.bottom;
    }
  }
  return convertPixelToGrid(nodePixelDims, grid, parentPixelDims);
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
  draggedNode: string | null,
  siblings: string[],
  newDimensions: WebloomGridDimensions,
  mousePos: Point,
): WebloomGridDimensions {
  const { columnsCount, rowsCount, col: x, row: y } = newDimensions;
  let left = x;
  let top = y;
  let colCount = columnsCount;
  for (const sibling of siblings) {
    // we don't want to check collisions with the node itself
    if (sibling === id || sibling === draggedNode) continue;
    // we don't want to check collisions with the node we are hovering over
    if (sibling === overId) continue;
    const otherNode = store.getState().tree[sibling];
    const otherBoundingRect = store.getState().getBoundingRect(sibling);
    const otherBottom = otherNode.row + otherNode.rowsCount;
    const otherTop = otherNode.row;
    const otherLeft = otherNode.col;
    const otherRight = otherNode.col + otherNode.columnsCount;
    const mouseLeftOfElement = mousePos.x < otherBoundingRect.left;
    const mouseRightOfElement = mousePos.x > otherBoundingRect.right;
    const mouseUnderElementOrExactlyOnBorder =
      mousePos.y >= otherBoundingRect.bottom;
    const mouseWithinElement =
      mousePos.x > otherBoundingRect.left &&
      mousePos.x < otherBoundingRect.right;
    if (top < otherBottom && top >= otherTop) {
      if (mouseWithinElement && mouseUnderElementOrExactlyOnBorder) {
        // mouse under other element and between its left and right
        top = otherBottom;
      } else if (
        mouseLeftOfElement &&
        left < otherLeft &&
        left + colCount > otherLeft
      ) {
        colCount = Math.min(colCount, otherLeft - left);
        if (colCount < 2) {
          left = otherLeft - 2;
          colCount = 2;
        }
      } else if (
        (left >= otherLeft && left < otherRight) ||
        (mouseRightOfElement && left < otherLeft)
      ) {
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
    col: left,
    row: top,
    columnsCount: colCount,
    rowsCount: rowsCount,
  };
}

export function convertGridToPixel(
  dims: WebloomGridDimensions,
  grid: [number, number],
  parentDims: Pick<WebloomPixelDimensions, 'x' | 'y'> = {
    x: 0,
    y: 0,
  },
): WebloomPixelDimensions {
  const [gridrow, gridcol] = grid;
  return {
    x: dims.col * gridcol + parentDims.x,
    y: dims.row * gridrow + parentDims.y,
    width: dims.columnsCount * gridcol,
    height: dims.rowsCount * gridrow,
  };
}
export function convertPixelToGrid(
  dims: WebloomPixelDimensions,
  grid: [number, number],
  parentDims: Pick<WebloomPixelDimensions, 'x' | 'y'>,
): WebloomGridDimensions {
  return {
    col: Math.round((dims.x - parentDims.x) / grid[1]),
    row: Math.round((dims.y - parentDims.y) / grid[0]),
    columnsCount: Math.round(dims.width / grid[1]),
    rowsCount: Math.round(dims.height / grid[0]),
  };
}

export function handleParentCollisions(
  dimensions: WebloomGridDimensions,
  parentDims: WebloomPixelDimensions,
  parentBoundingRect: BoundingRect,
  grid: [number, number],
  clipBottom = false,
) {
  const [gridrow, gridcol] = grid;
  const boundingRect = getBoundingRect(
    convertGridToPixel(dimensions, [gridrow, gridcol], parentDims),
  );

  //left < parentLeft
  if (boundingRect.left < parentBoundingRect.left) {
    dimensions.columnsCount =
      (boundingRect.right - parentBoundingRect.left) / gridcol;
    dimensions.col = 0;
    if (dimensions.columnsCount < 1) {
      dimensions.columnsCount = 1;
    }
  }
  //right >= parentRight
  if (boundingRect.right > parentBoundingRect.right) {
    // colCount = Math.min(colCount, parentRight - left);
    const diff = parentBoundingRect.right - boundingRect.left;
    const newColCount = Math.floor(diff / gridcol);
    dimensions.columnsCount = Math.min(dimensions.columnsCount, newColCount);
    if (dimensions.columnsCount < 1) {
      dimensions.columnsCount = 1;
    }
  }

  //top < parentTop
  if (boundingRect.top < parentBoundingRect.top) {
    dimensions.row = 0;
    dimensions.rowsCount =
      (boundingRect.bottom - parentBoundingRect.top) / gridrow;
  }
  //bottom >= parentBottom
  if (boundingRect.bottom > parentBoundingRect.bottom) {
    if (clipBottom) {
      const diff = parentBoundingRect.bottom - boundingRect.top;
      const newRowCount = Math.floor(diff / gridrow);
      dimensions.rowsCount = Math.min(dimensions.rowsCount, newRowCount);
      if (dimensions.rowsCount < 1) {
        dimensions.rowsCount = 1;
      }
    }
  }
  return dimensions;
}
const store = create<WebloomState & WebloomActions & WebloomGetters>()(
  (set, get) => ({
    tree: {},
    autoCompleteKeys: {
      widgets: [],
      actions: [],
    },
    draggedNode: null,
    overNode: null,
    selectedNodeIds: new Set(),
    newNode: null,
    newNodeTranslate: { x: 0, y: 0 },
    mousePos: { x: 0, y: 0 },
    resizedNode: null,
    editorWidth: 0,
    editorHeight: 0,
    getSelectedNodeIds() {
      return get().selectedNodeIds;
    },
    setResizedNode(id) {
      set({ resizedNode: id });
    },
    getGridDimensions(id) {
      const node = get().tree[id];
      return {
        col: node.col,
        row: node.row,
        columnsCount: node.columnsCount,
        rowsCount: node.rowsCount,
      };
    },
    setEditorDimensions({ width, height }) {
      set((state) => {
        return {
          ...state,
          editorWidth: width || state.editorWidth,
          editorHeight: height || state.editorHeight,
        };
      });
    },
    setProps(id, newProps) {
      set((state) => {
        const node = state.tree[id];
        if (!node) return state;
        const newTree = {
          ...state.tree,
          [id]: {
            ...node,
            props: {
              ...node.props,
              ...newProps,
            },
          },
        };
        return { tree: newTree };
      });
    },
    setProp(id, key, value) {
      get().setProps(id, { [key]: value });
    },
    setWidgetMeta(id, key, value) {
      set((state) => {
        const node = state.tree[id];
        if (!node) return state;
        const newTree = {
          ...state.tree,
          [id]: {
            ...node,
            [key]: value,
          },
        };
        return { tree: newTree };
      });
    },

    getDropCoordinates(startPosition, delta, id, overId, forShadow = false) {
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
      let dimensions = {
        col: gridPosition.x,
        row: gridPosition.y,
        columnsCount: el.columnsCount,
        rowsCount: el.rowsCount,
      };
      const draggedNode = get().draggedNode;
      const overEl = tree[overId];
      if (overId !== EDITOR_CONSTANTS.ROOT_NODE_ID && overId !== draggedNode) {
        dimensions = handleHoverCollision(
          dimensions,
          get().getPixelDimensions(parent.id),
          get().getBoundingRect(overId),
          [gridrow, gridcol],
          !!overEl.isCanvas!,
          mousePos,
          forShadow,
        );
      }
      dimensions = handleLateralCollisions(
        id,
        overId,
        draggedNode,
        parent.nodes,
        dimensions,
        mousePos,
      );
      dimensions = handleParentCollisions(
        dimensions,
        get().getPixelDimensions(el.parent!),
        parentBoundingRect,
        [gridrow, gridcol],
        forShadow,
      );
      dimensions.columnsCount = Math.min(
        EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        dimensions.columnsCount,
      );
      dimensions.rowsCount = Math.min(parent.rowsCount, dimensions.rowsCount);

      return dimensions;
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
      set((state) => {
        const parent = state.tree[parentId];
        parent.nodes.sort((a, b) => -state.tree[a].row + state.tree[b].row);
        if (node.isCanvas) {
          get().resizeCanvas(node.id, {
            columnsCount: node.columnsCount,
            rowsCount: node.rowsCount,
          });
        }
        return { tree: { ...state.tree, [parentId]: parent } };
      });
    },
    /**
     * @returns stack of deleted nodes
     */
    removeNode(id, recursive = false) {
      // cannot delete a non existing node
      if (!(id in get().tree)) return [];
      const stack: WebloomNode[] = [];
      const node = get().tree[id];
      const toBeDeletedNodes = [node.id];
      function recurse(id: string) {
        const node = get().tree[id];
        if (!node) return;
        toBeDeletedNodes.push(node.id);
        for (const child of node.nodes) {
          recurse(child);
        }
      }
      if (recursive) recurse(id);
      const newTree = { ...get().tree };
      for (const nodeId of toBeDeletedNodes) {
        const node = newTree[nodeId];
        if (!node) continue;
        stack.push(node);
        const parent = newTree[node.parent];
        if (parent) {
          parent.nodes = parent.nodes.filter((nodeId) => nodeId !== id);
          newTree[node.parent] = parent;
        }
        delete newTree[nodeId];
      }
      set({ tree: newTree });
      return stack;
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
        newTree[parentId].nodes.sort(
          (a, b) => -get().tree[a].row + get().tree[b].row,
        );
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
      if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) return get().getNode(id)!;
      const node = get().getNode(id)!;
      const parent = get().getNode(node.parent)!;
      if (parent.isCanvas) return parent;
      return get().getCanvas(node?.parent || EDITOR_CONSTANTS.ROOT_NODE_ID);
    },
    getGridSize: (id) => {
      const canvasParent = get().getCanvas(id);
      return [EDITOR_CONSTANTS.ROW_HEIGHT, canvasParent.columnWidth!];
    },
    /**
     * gets actual x, y coordinates of a node
     */
    getPixelDimensions(id) {
      const node = get().getNode(id)!;
      const parent = get().getCanvas(id)!;
      if (node.id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
        return {
          x: 0,
          y: 0,
          columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
          rowsCount: parent.rowsCount,
          columnWidth: parent.columnWidth,
          width: Math.round(
            parent.columnWidth! * EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
          ),
          height: parent.rowsCount * EDITOR_CONSTANTS.ROW_HEIGHT,
        };
      }
      const gridColSize = parent.columnWidth!;
      const gridRowSize = EDITOR_CONSTANTS.ROW_HEIGHT;
      const parentDimensions = get().getPixelDimensions(node.parent);
      return convertGridToPixel(
        {
          row: node.row,
          col: node.col,
          columnsCount: node.columnsCount,
          rowsCount: node.rowsCount,
        },
        [gridRowSize, gridColSize],
        parentDimensions,
      );
    },
    getRelativePixelDimensions(id) {
      const node = get().getNode(id)!;
      if (node.id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
        return {
          x: 0,
          y: 0,
          columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
          rowsCount: node.rowsCount,
          columnWidth: node.columnWidth,
          width: node.columnWidth! * EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
          height: node.rowsCount * EDITOR_CONSTANTS.ROW_HEIGHT,
        };
      }
      const parent = get().getNode(node.parent)!;
      const gridColSize = parent.columnWidth!;
      const gridRowSize = EDITOR_CONSTANTS.ROW_HEIGHT;
      return convertGridToPixel(
        {
          row: node.row,
          col: node.col,
          columnsCount: node.columnsCount,
          rowsCount: node.rowsCount,
        },
        [gridRowSize, gridColSize],
        {
          x: 0,
          y: 0,
        },
      );
    },
    getBoundingRect: (id: string): BoundingRect => {
      return getBoundingRect(get().getPixelDimensions(id));
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
      const oldColumnWidth = node.columnWidth ?? 0;
      if (node.isCanvas) {
        let newColumnWidth = dimensions.columnWidth || oldColumnWidth;
        if (id !== EDITOR_CONSTANTS.ROOT_NODE_ID) {
          const [, gridcol] = get().getGridSize(id);
          const columnsCount = dimensions.columnsCount || node.columnsCount;
          newColumnWidth =
            (columnsCount * gridcol) / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
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
      function recurse(id: string, dimensions: Partial<WebloomGridDimensions>) {
        const node = get().tree[id];
        get().setDimensions(id, dimensions);
        const children = node.nodes;
        for (const child of children) {
          const childNode = get().tree[child];
          const newColumnWidth =
            (childNode.columnsCount * dimensions.columnWidth!) /
            EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
          recurse(child, { columnWidth: newColumnWidth });
        }
      }
    },
    moveNodeIntoGrid(id, newCoords) {
      let changedNodesOriginalCoords: MoveNodeReturnType = {};
      const node = get().tree[id];
      const parent = get().tree[node.parent];
      const firstNodeOriginalDimensions = {
        col: node.col,
        row: node.row,
        columnsCount: node.columnsCount,
        rowsCount: node.rowsCount,
      };
      const nodes = [...parent.nodes];
      function recurse(id: string, newCoords: Partial<WebloomGridDimensions>) {
        const state = get();
        const node = state.tree[id];
        if (!node) return state;
        newCoords.row ??= node.row;
        newCoords.col ??= node.col;
        newCoords.columnsCount ??= node.columnsCount;
        newCoords.rowsCount ??= node.rowsCount;
        if (
          newCoords.row === node.row &&
          newCoords.col === node.col &&
          newCoords.columnsCount === node.columnsCount &&
          newCoords.rowsCount === node.rowsCount
        )
          return;
        const parent = state.tree[node.parent];
        let colCount = newCoords.columnsCount;
        const rowCount = newCoords.rowsCount;
        const left = newCoords.col;
        const top = newCoords.row;
        const right = left + colCount;
        const bottom = top + rowCount;
        const toBeMoved: { id: string; col?: number; row?: number }[] = [];
        nodes.forEach((nodeId) => {
          if (nodeId === id) return false;
          const otherNode = state.tree[nodeId];
          if (!otherNode) return false;
          const otherBottom = otherNode.row + otherNode.rowsCount;
          const otherTop = otherNode.row;
          const otherLeft = otherNode.col;
          const otherRight = otherNode.col + otherNode.columnsCount;
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
            toBeMoved.push({ id: nodeId, row: bottom });
          }
        });
        const parentBoundingRect = get().getBoundingRect(parent.id);
        const parentTop = parentBoundingRect.top;
        const gridrow = EDITOR_CONSTANTS.ROW_HEIGHT;
        const nodeTop = top * gridrow + parentTop;
        const nodeBottom = nodeTop + rowCount * gridrow;
        if (nodeBottom > parentBoundingRect.bottom) {
          // the voo-doo value is just to add pading under the expension resulted by the element
          const diff = nodeBottom - parentBoundingRect.bottom + 100;
          const newRowCount = Math.floor(diff / gridrow);
          if (parent.id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
            get().resizeCanvas(parent.id, {
              rowsCount: parent.rowsCount + newRowCount,
            });
          } else {
            const orgCoords = get().moveNodeIntoGrid(parent.id, {
              rowsCount: parent.rowsCount + newRowCount,
            });
            changedNodesOriginalCoords = {
              ...changedNodesOriginalCoords,
              ...orgCoords,
            };
          }
        }
        colCount = Math.min(EDITOR_CONSTANTS.NUMBER_OF_COLUMNS, colCount);
        if (node.isCanvas) {
          get().resizeCanvas(id, {
            columnsCount: colCount,
            rowsCount: rowCount,
            col: left,
            row: top,
          });
        } else {
          get().setDimensions(id, {
            col: left,
            row: top,
            columnsCount: colCount,
            rowsCount: rowCount,
          });
        }
        toBeMoved.forEach((node) => {
          changedNodesOriginalCoords[node.id] ??= {
            col: state.tree[node.id].col,
            row: state.tree[node.id].row,
            columnsCount: state.tree[node.id].columnsCount,
            rowsCount: state.tree[node.id].rowsCount,
          };
        });
        toBeMoved.forEach((node) => {
          recurse(node.id, { row: node.row });
        });
      }
      recurse(id, newCoords);
      return {
        ...changedNodesOriginalCoords,
        [id]: {
          row: firstNodeOriginalDimensions.row,
          col: firstNodeOriginalDimensions.col,
          columnsCount: firstNodeOriginalDimensions.columnsCount,
          rowsCount: firstNodeOriginalDimensions.rowsCount,
        },
      };
    },
  }),
);

export { store };
export default store;
