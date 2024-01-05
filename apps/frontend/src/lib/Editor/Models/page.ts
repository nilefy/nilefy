import { Point } from '@/types';
import { EvaluationContext } from '../evaluation';
import { WebloomQuery } from './query';
import { WebloomWidget } from './widget';
import { action, computed, makeObservable, observable, toJS } from 'mobx';
import {
  BoundingRect,
  ShadowElement,
  WebloomGridDimensions,
} from '../interface';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  checkOverlap,
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
  isSameCoords,
  normalizeCoords,
} from '../utils';
type MoveNodeReturnType = Record<string, WebloomGridDimensions>;

export class WebloomPage {
  id: string;
  widgets: Record<string, WebloomWidget> = {};
  queries: Record<string, WebloomQuery> = {};
  mouseOverWidgetId: string | null = null;
  selectedNodeIds: Set<string> = new Set();
  draggedWidgetId: string | null = null;
  resizedWidgetId: string | null = null;
  newNode: WebloomWidget | null = null;
  newNodeTranslate: Point | null = null;
  shadowElement: ShadowElement | null = null;
  mousePosition: Point | null = null;
  constructor({
    id,
    widgets,
    queries,
  }: {
    id: string;
    widgets: Record<string, InstanceType<typeof WebloomWidget>['snapshot']>;
    queries: Record<string, WebloomQuery>;
  }) {
    this.id = id;
    const widgetMap: Record<string, WebloomWidget> = {};
    Object.values(widgets).forEach((widget) => {
      widgetMap[widget.id] = new WebloomWidget({
        ...widget,
        page: this,
      });
    });
    this.widgets = widgetMap;
    this.queries = queries;
    makeObservable(this, {
      widgets: observable,
      queries: observable,
      mouseOverWidgetId: observable,
      selectedNodeIds: observable,
      draggedWidgetId: observable,
      resizedWidgetId: observable,
      newNode: observable,
      newNodeTranslate: observable,
      shadowElement: observable,
      context: computed.struct,
      removeWidget: action,
      addWidget: action,
      setDraggedWidgetId: action,
      setResizedWidgetId: action,
      setNewNode: action,
      setNewNodeTranslate: action,
      setOverWidgetId: action,
      setSelectedNodeIds: action,
      setShadowElement: action,
      resizeCanvas: action,
      moveWidgetIntoGrid: action,
      moveWidget: action,
      id: observable,
      mousePosition: observable,
      setMousePosition: action,
      firstSelectedWidget: computed,
      rootWidget: computed,
    });
  }
  get firstSelectedWidget() {
    return [...this.selectedNodeIds][0];
  }
  setMousePosition(point: Point | null) {
    this.mousePosition = point;
  }

  setNewNodeTranslate(point: Point | null) {
    this.newNodeTranslate = point;
  }
  setOverWidgetId(id: string | null) {
    this.mouseOverWidgetId = id;
  }
  setShadowElement(element: ShadowElement | null) {
    this.shadowElement = element;
  }
  /**
   * @description returns the evaluation context for the page. This is used to give autocomplete suggestions.
   */
  get context() {
    const context: EvaluationContext = {
      widgets: {},
      queries: {},
    };
    Object.values(this.widgets).forEach((widget) => {
      context['widgets'][widget.id] = widget.dynamicProps;
    });
    Object.values(this.queries).forEach((query) => {
      context['queries'][query.id] = query.value;
    });
    return context;
  }

  /**
   *
   * @param widgetArgs the constructor args for the widget
   * @description adds a widget to the page.
   */
  addWidget(
    widgetArgs: Omit<ConstructorParameters<typeof WebloomWidget>[0], 'page'>,
  ) {
    const widget = new WebloomWidget({
      ...widgetArgs,
      page: this,
    });
    this.widgets[widget.id] = widget;
    const parent = this.widgets[widgetArgs.parentId];
    parent.addChild(widget.id);
    if (widget.isCanvas) {
      this.resizeCanvas(widget.id, {
        columnsCount: widget.columnsCount,
        rowsCount: widget.rowsCount,
      });
    }
  }
  getWidgetById(id: string) {
    return this.widgets[id];
  }
  get rootWidget() {
    return this.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID];
  }
  resizeCanvas(id: string, dimensions: Partial<WebloomGridDimensions>) {
    const widget = this.widgets[id];
    const oldColumnWidth = widget.columnWidth ?? 0;
    if (widget.isCanvas) {
      let newColumnWidth = dimensions.columnWidth || oldColumnWidth;
      if (id !== EDITOR_CONSTANTS.ROOT_NODE_ID) {
        const [, gridcol] = widget.gridSize;
        const columnsCount = dimensions.columnsCount || widget.columnsCount;
        newColumnWidth =
          (columnsCount * gridcol!) / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
      }
      //recurse to set the new columnWidth of all children
      recurse.call(this, id, {
        ...dimensions,
        columnWidth: newColumnWidth,
        columnsCount: dimensions.columnsCount || widget.columnsCount,
      });
    } else {
      widget.setDimensions(dimensions);
    }
    function recurse(
      this: WebloomPage,
      id: string,
      dimensions: Partial<WebloomGridDimensions>,
    ) {
      const node = this.widgets[id];
      widget.setDimensions(dimensions);
      const children = node.nodes;
      for (const child of children) {
        const childNode = this.widgets[child];
        const newColumnWidth =
          (childNode.columnsCount * dimensions.columnWidth!) /
          EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
        recurse.call(this, child, { columnWidth: newColumnWidth });
      }
    }
  }

  setDraggedWidgetId(id: string | null) {
    this.draggedWidgetId = id;
  }

  setResizedWidgetId(id: string | null) {
    this.resizedWidgetId = id;
  }

  setNewNode(node: WebloomWidget | null) {
    this.newNode = node;
  }

  setSelectedNodeIds(ids: Set<string>): void;
  setSelectedNodeIds(cb: (ids: Set<string>) => Set<string>): void;
  setSelectedNodeIds(
    idsOrCb: Set<string> | ((ids: Set<string>) => Set<string>),
  ): void {
    if (typeof idsOrCb === 'function') {
      this.selectedNodeIds = idsOrCb(new Set(this.selectedNodeIds));
    } else {
      this.selectedNodeIds = idsOrCb;
    }
  }

  /**
   *
   * @param id
   * @param recursive if true, removes all the children of the widget as well.
   * @description removes a widget from the page.
   * @returns
   */
  removeWidget(
    id: string,
    recursive = false,
  ): InstanceType<typeof WebloomWidget>['snapshot'][] {
    if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) return [];
    if (!(id in this.widgets)) return [];
    const stack = [];
    const widget = this.widgets[id];
    const toBeDeletedNodes = [widget.id];
    function recurse(this: WebloomPage, id: string) {
      const node = this.widgets[id];
      if (!node) return;
      toBeDeletedNodes.push(node.id);
      const children = node.nodes;
      for (const child of children) {
        recurse.call(this, child);
      }
    }
    if (recursive) recurse.call(this, id);
    for (const nodeId of toBeDeletedNodes) {
      const node = this.widgets[nodeId];
      if (!node) continue;
      stack.push(node.snapshot);
      // remove from parent
      const parent = this.widgets[node.parentId];
      if (parent) parent.removeChild(nodeId);
      // remove from page
      delete this.widgets[nodeId];
    }
    // return the stack of deleted widgets for undo
    return stack;
  }

  /**
   *
   * @param id
   * @param parentId
   * @description moves a node to a new parent.
   * @returns
   */
  moveWidget(id: string, parentId: string) {
    const widget = this.widgets[id];
    const oldParent = widget.parent;
    if (oldParent.id === parentId || id === parentId) return;
    const newParent = this.widgets[parentId];
    if (!newParent.isCanvas) {
      throw new Error('Cannot move a widget to a non canvas widget');
    }
    // calculate newColumnCount for the widget
    const oldColCount = widget.columnsCount;
    const oldParentColumnWidth = oldParent.columnWidth!;
    const newParentColumnWidth = newParent.columnWidth!;
    const newColumnCount = Math.round(
      (oldColCount * oldParentColumnWidth) / newParentColumnWidth,
    );
    widget.setDimensions({ columnsCount: newColumnCount });
    oldParent.removeChild(id);
    newParent.addChild(id);
  }
  /**
   *
   * @param nodeGridBoundingRect
   * @param nodes
   * @param id
   * @description a helper method that finds all the nodes that overlap with the node being moved
   * @returns  a list of nodes that overlap with the node being moved
   */
  private findOverlappingNodesToMove(
    nodeGridBoundingRect: ReturnType<typeof getGridBoundingRect>,
    nodes: string[],
    id: string,
  ) {
    const overlappingNodesToMove: {
      id: string;
      col?: number;
      row?: number;
    }[] = [];
    nodes.forEach((nodeId) => {
      if (nodeId === id) return false;
      const otherNode = this.widgets[nodeId];
      if (!otherNode) return false;
      const otherNodeGridBoundingRect = otherNode.gridBoundingRect;
      if (checkOverlap(otherNodeGridBoundingRect, nodeGridBoundingRect)) {
        overlappingNodesToMove.push({
          id: nodeId,
          row: nodeGridBoundingRect.bottom,
        });
      }
    });
    return overlappingNodesToMove;
  }
  /**
   *
   * @param nodePixelBoundingRect
   * @param parentBoundingRect
   * @param gridrow
   * @param parent
   * @param changedNodesOriginalCoords
   * @description a helper method that handles the vertical expansion of a node
   */
  private handleVerticalExpansion(
    nodePixelBoundingRect: BoundingRect,
    parentBoundingRect: BoundingRect,
    gridrow: number,
    parent: WebloomWidget,
    changedNodesOriginalCoords: MoveNodeReturnType,
  ) {
    if (nodePixelBoundingRect.bottom > parentBoundingRect.bottom) {
      const verticalExpansion =
        nodePixelBoundingRect.bottom - parentBoundingRect.bottom + 100;
      const newRowCount = Math.floor(verticalExpansion / gridrow);
      if (parent.isRoot) {
        this.resizeCanvas(parent.id, {
          rowsCount: parent.rowsCount + newRowCount,
        });
      } else {
        const originalParentCoords = this.moveWidgetIntoGrid(parent.id, {
          rowsCount: parent.rowsCount + newRowCount,
        });
        return {
          ...changedNodesOriginalCoords,
          ...originalParentCoords,
        };
      }
    }
    return changedNodesOriginalCoords;
  }
  /**
   *
   * @param id id of the node to be moved
   * @param newCoords the drop coordinates of the node
   * @description moves a node to a new position in the grid, this functions performs side effects. namely it'll push other nodes recursively to make space for the node being moved.
   * @returns the original coordinates of all the affected nodes. (used for undo)
   */
  moveWidgetIntoGrid(
    id: string,
    newCoords: Partial<WebloomGridDimensions>,
  ): MoveNodeReturnType {
    let changedNodesOriginalCoords: MoveNodeReturnType = {};
    const widget = this.widgets[id];
    const parent = widget.parent;
    const firstNodeOriginalDimensions = widget.gridDimensions;
    const nodes = parent.nodes;

    function moveNodeRecursively(
      this: WebloomPage,
      id: string,
      newCoordsP: Partial<WebloomGridDimensions>,
    ) {
      const node = this.widgets[id];
      if (!node) return;
      const gridDimensions = node.gridDimensions;
      const newCoords = normalizeCoords(newCoordsP, gridDimensions);
      // if the node is the same as the newCoords, return
      if (isSameCoords(newCoords, gridDimensions)) return;
      const nodeGridBoundingRect = getGridBoundingRect(newCoords);
      const overlappingNodesToMove = this.findOverlappingNodesToMove(
        nodeGridBoundingRect,
        nodes,
        id,
      );
      const parentBoundingRect = parent.gridBoundingRect;
      const [gridrow, gridcol] = parent.gridSize as [number, number];
      const nodePixelDims = convertGridToPixel(
        newCoords as WebloomGridDimensions,
        [gridrow, gridcol],
        parent.pixelDimensions,
      );
      const nodePixelBoundingRect = getBoundingRect(nodePixelDims);
      changedNodesOriginalCoords = this.handleVerticalExpansion(
        nodePixelBoundingRect,
        parentBoundingRect,
        gridrow,
        parent,
        changedNodesOriginalCoords,
      );
      newCoords.columnsCount = Math.min(
        EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        newCoords.columnsCount,
      );
      if (node.isCanvas) {
        this.resizeCanvas(id, newCoords);
      } else {
        node.setDimensions(newCoords);
      }
      overlappingNodesToMove.forEach((node) => {
        changedNodesOriginalCoords[node.id] ??=
          this.widgets[node.id].gridDimensions;
      });
      overlappingNodesToMove.forEach((node) => {
        moveNodeRecursively.call(this, node.id, { row: node.row });
      });
    }
    moveNodeRecursively.call(this, id, newCoords);
    return {
      ...changedNodesOriginalCoords,
      [id]: firstNodeOriginalDimensions,
    };
  }

  get snapshot() {
    return {
      id: this.id,
      widgets: this.snapshotWidgets(),
      queries: this.snapshotQueries(),
    };
  }

  snapshotWidgets() {
    return Object.values(this.widgets).map((widget) => widget.snapshot);
  }

  snapshotQueries() {
    return Object.values(this.queries).map((query) => query.snapshot);
  }
}
