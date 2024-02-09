import { Point } from '@/types';
import { EvaluationContext } from '../evaluation';
import { WebloomQuery } from './query';
import { WebloomWidget } from './widget';
import { action, comparer, computed, makeObservable, observable } from 'mobx';
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
import { analyzeDependancies } from '../dependancyUtils';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
export type MoveNodeReturnType = Record<string, WebloomGridDimensions>;
export type WebloomEntity = WebloomWidget | WebloomQuery;
export class WebloomPage {
  id: string;
  name: string;
  handle: string;
  widgets: Record<string, WebloomWidget> = {};
  queries: Record<string, WebloomQuery> = {};
  mouseOverWidgetId: string | null = null;
  /**
   * please note that those node always in the same level in the widgets tree
   */
  selectedNodeIds: Set<string>;
  draggedWidgetId: string | null = null;
  resizedWidgetId: string | null = null;
  newNode: WebloomWidget | null = null;
  newNodeTranslate: Point | null = null;
  shadowElement: ShadowElement | null = null;
  dependencyManager: DependencyManager;
  evaluationManger: EvaluationManager;
  mousePosition: Point = {
    x: 0,
    y: 0,
  };
  width: number = 0;
  height: number = 0;
  constructor({
    id,
    name,
    handle,
    widgets,
    queries,
  }: {
    id: string;
    name: string;
    handle: string;
    widgets: Record<string, InstanceType<typeof WebloomWidget>['snapshot']>;
    queries: Record<string, WebloomQuery>;
  }) {
    makeObservable(this, {
      widgets: observable,
      queries: observable,
      mouseOverWidgetId: observable,
      selectedNodeIds: observable,
      selectedNodesSize: computed,
      firstSelectedWidget: computed,
      draggedWidgetId: observable,
      resizedWidgetId: observable,
      newNode: observable,
      newNodeTranslate: observable,
      shadowElement: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
      removeWidget: action,
      addWidget: action,
      setDraggedWidgetId: action,
      setResizedWidgetId: action,
      setNewNode: action,
      setNewNodeTranslate: action,
      setOverWidgetId: action,
      setSelectedNodeIds: action,
      setShadowElement: action,
      moveWidgetIntoGrid: action,
      moveWidget: action,
      id: observable,
      name: observable,
      handle: observable,
      mousePosition: observable,
      setMousePosition: action,
      rootWidget: computed,
      width: observable,
      height: observable,
      setPageDimensions: action,
      adjustDimensions: action,
      snapshot: computed,
    });
    this.id = id;
    this.name = name;
    this.handle = handle;
    const widgetMap: Record<string, WebloomWidget> = {};
    this.queries = queries;
    this.selectedNodeIds = new Set();
    Object.values(widgets).forEach((widget) => {
      widgetMap[widget.id] = new WebloomWidget({
        ...widget,
        page: this,
      });
    });
    this.dependencyManager = new DependencyManager({
      page: this,
    });
    this.evaluationManger = new EvaluationManager(this);
    this.widgets = widgetMap;
    // set the height of the page to the height of the root node because the root node is the tallest node in the page.
    this.height =
      this.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID].rowsCount *
      EDITOR_CONSTANTS.ROW_HEIGHT;
    // analyze dependancies
    const allDependencies: Array<DependencyRelation> = [];
    Object.values(widgetMap).forEach((widget) => {
      for (const prop in widget.rawValues) {
        const value = widget.rawValues[prop];
        const { dependencies, isCode } = analyzeDependancies(
          value,
          prop,
          widget.id,
          this.context,
        );
        if (isCode) {
          this.evaluationManger.setRawValueIsCode(widget.id, prop, true);
          allDependencies.push(...dependencies);
        }
      }
    });
    this.dependencyManager.addDependencies(allDependencies);
  }
  setSelectedNodeIds(ids: Set<string>): void;
  setSelectedNodeIds(cb: (ids: Set<string>) => Set<string>): void;
  setSelectedNodeIds(
    idsOrCb: Set<string> | ((ids: Set<string>) => Set<string>),
  ): void {
    let tempIds: Set<string>;
    if (typeof idsOrCb === 'function') {
      tempIds = idsOrCb(new Set(this.selectedNodeIds));
    } else {
      tempIds = idsOrCb;
    }
    this.selectedNodeIds.clear();
    tempIds.forEach((id) => this.selectedNodeIds.add(id));
  }

  get firstSelectedWidget() {
    return [...this.selectedNodeIds][0];
  }
  get selectedNodesSize() {
    return this.selectedNodeIds.size;
  }

  setMousePosition(point: Point) {
    this.mousePosition = point;
  }
  adjustDimensions() {
    const dims = this.rootWidget.pixelDimensions;
    this.width = dims.width;
    this.height = dims.height;
  }
  setPageDimensions(
    dims: Partial<{
      width: number;
      height: number;
    }>,
  ) {
    this.width = dims.width || this.width;
    this.height = dims.height || this.height;
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
    const context: EvaluationContext = {};
    Object.values(this.widgets).forEach((widget) => {
      if (widget.isRoot) return;
      context[widget.id] = widget.rawValues;
    });
    Object.values(this.queries).forEach((query) => {
      context[query.id] = query.rawValues;
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
  }
  getWidgetById(id: string) {
    return this.widgets[id];
  }
  get rootWidget() {
    return this.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID];
  }
  getEntityById(id: string): WebloomEntity | undefined {
    return this.widgets[id] || this.queries[id];
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
    const toBeDeletedNodes: string[] = [id];
    // just collect ids of the nodes to be deleted
    function recurse(this: WebloomPage, id: string) {
      const node = this.widgets[id];
      if (!node) return;
      toBeDeletedNodes.push(node.id);
      const childrenIds = node.nodes;
      for (const childId of childrenIds) {
        recurse.call(this, childId);
      }
    }
    if (recursive) recurse.call(this, id);
    while (toBeDeletedNodes.length > 0) {
      const nodeId = toBeDeletedNodes.pop() as string;
      const node = this.widgets[nodeId];
      if (!node) continue;
      stack.push(node.snapshot);
      // remove from parent
      const parent = this.widgets[node.parentId];
      if (parent) parent.removeChild(nodeId);
      // remove from page
      this.widgets[nodeId].cleanup();
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
      const newParentRowCount = Math.floor(verticalExpansion / gridrow);
      if (parent.isRoot) {
        parent.setDimensions({
          rowsCount: parent.rowsCount + newParentRowCount,
        });
        return {
          ...changedNodesOriginalCoords,
          [parent.id]: {
            ...parent.gridDimensions,
            rowsCount: parent.rowsCount - newParentRowCount,
          },
        };
      } else {
        const originalParentCoords = this.moveWidgetIntoGrid(parent.id, {
          rowsCount: parent.rowsCount + newParentRowCount,
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
      _newCoords: Partial<WebloomGridDimensions>,
    ) {
      const node = this.widgets[id];
      if (!node) return;
      const gridDimensions = node.gridDimensions;
      const newCoords = normalizeCoords(_newCoords, gridDimensions);
      // if the node is the same as the newCoords, return
      // if (isSameCoords(newCoords, gridDimensions)) return;
      const nodeGridBoundingRect = getGridBoundingRect(newCoords);
      const overlappingNodesToMove = this.findOverlappingNodesToMove(
        nodeGridBoundingRect,
        nodes,
        id,
      );
      const [gridrow, gridcol] = parent.gridSize as [number, number];
      const nodePixelDims = convertGridToPixel(
        newCoords as WebloomGridDimensions,
        [gridrow, gridcol],
        parent.pixelDimensions,
      );
      const nodePixelBoundingRect = getBoundingRect(nodePixelDims);
      changedNodesOriginalCoords = this.handleVerticalExpansion(
        nodePixelBoundingRect,
        parent.boundingRect,
        gridrow,
        parent,
        changedNodesOriginalCoords,
      );
      newCoords.columnsCount = Math.min(
        EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        newCoords.columnsCount,
      );
      node.setDimensions(newCoords);
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
