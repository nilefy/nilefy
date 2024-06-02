import { Point } from '@/types';
import { WebloomWidget } from './widget';
import { action, computed, makeObservable, observable } from 'mobx';
import {
  BoundingRect,
  ShadowElement,
  WebloomGridDimensions,
} from '../interface';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import {
  checkOverlap,
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
  normalizeCoords,
} from '../utils';
import { WorkerBroker } from './workerBroker';
import { CursorManager } from './cursorManager';

import { WebloomDisposable } from './interface';
import { WebloomWidgets } from '@/pages/Editor/Components';

export type MoveNodeReturnType = Record<string, WebloomGridDimensions>;
export type NewWidgePayload = Omit<
  ConstructorParameters<typeof WebloomWidget>[0],
  'page'
>;
export class WebloomPage implements WebloomDisposable {
  id: string;
  name: string;
  handle: string;
  widgets: Record<string, WebloomWidget> = {};
  hoveredWidgetId: string | null = null;
  /**
   * please note that those node always in the same level in the widgets tree
   */
  selectedNodeIds: Set<string>;
  draggedWidgetId: string | null = null;
  resizedWidgetId: string | null = null;
  /**
   * widget is dragging but hasn't touched the canvas yet
   */
  isPrematureDragging: boolean = false;
  newNode: WebloomWidget | null = null;
  newNodeTranslate: Point | null = null;
  shadowElement: ShadowElement | null = null;
  private cursorManager: CursorManager;
  mousePosition: Point = {
    x: 0,
    y: 0,
  };
  width: number = 0;
  height: number = 0;
  readonly workerBroker: WorkerBroker;
  constructor({
    id,
    name,
    handle,
    widgets,
    workerBroker,
  }: {
    id: string;
    name: string;
    handle: string;
    widgets: Record<string, InstanceType<typeof WebloomWidget>['snapshot']>;
    workerBroker: WorkerBroker;
  }) {
    makeObservable(this, {
      widgets: observable,
      hoveredWidgetId: observable,
      selectedNodeIds: observable,
      selectedNodesSize: computed,
      firstSelectedWidget: computed,
      draggedWidgetId: observable,
      resizedWidgetId: observable,
      newNode: observable,
      newNodeTranslate: observable,
      shadowElement: observable,
      removeWidget: action,
      addWidget: action,
      _addWidget: action,
      setDraggedWidgetId: action,
      setResizedWidgetId: action,
      setNewNode: action,
      setNewNodeTranslate: action,
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
      isDragging: computed,
      isResizing: computed,
      clearSelectedNodes: action,
      setHoveredWidgetId: action,
      removeSelectedNode: action,
      selectAll: action,
      isPrematureDragging: observable,
      setIsPermatureDragging: action,
    });

    this.id = id;
    this.workerBroker = workerBroker;
    this.name = name;
    this.handle = handle;
    const widgetMap: Record<string, WebloomWidget> = {};
    this.selectedNodeIds = new Set();
    Object.values(widgets).forEach((widget) => {
      widgetMap[widget.id] = new WebloomWidget({
        ...widget,
        page: this,
      });
    });
    this.widgets = widgetMap;

    // set the height of the page to the height of the root node because the root node is the tallest node in the page.
    this.height =
      this.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID].rowsCount *
      EDITOR_CONSTANTS.ROW_HEIGHT;

    this.cursorManager = new CursorManager(this);
  }
  selectAll() {
    this.selectedNodeIds = new Set(this.rootWidget.nodes);
  }

  clearSelectedNodes() {
    this.selectedNodeIds.clear();
  }

  setHoveredWidgetId(id: string | null) {
    this.hoveredWidgetId = id;
  }
  setIsPermatureDragging(isDragging: boolean) {
    this.isPrematureDragging = isDragging;
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
  removeSelectedNode(id: string) {
    this.selectedNodeIds.delete(id);
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

  setShadowElement(element: ShadowElement | null) {
    this.shadowElement = element;
  }

  /**
   *
   * @param widgetArgs the constructor args for the widget
   * @description adds a widget to the page.
   */
  addWidget(
    widgetArgs: Omit<ConstructorParameters<typeof WebloomWidget>[0], 'page'>,
  ): string {
    const widget = new WebloomWidget({
      ...widgetArgs,
      page: this,
    });
    this._addWidget(widget);
    const parent = this.widgets[widgetArgs.parentId];
    parent.addChild(widget.id);
    const widgetConfig = WebloomWidgets[widgetArgs.type];
    const ops: (() => void)[] = [];
    // handle composed widgets
    if (widgetConfig.blueprint) {
      for (const child of widgetConfig.blueprint.children) {
        let newCol = child.col || 0;
        // This is kind of implicit, but whoever writes the config expects the col to be relative to the parent layout and this does that.
        const newColPrecentage =
          (newCol / widgetConfig.config.layoutConfig.colsCount) * 100;
        newCol = Math.round((newColPrecentage / 100) * parent.columnsCount);
        const id = this.addWidget({
          ...child,
          parentId: widget.id,
          col: newCol,
        });
        if (child.onAttach) {
          ops.push(() => {
            child.onAttach!(this.widgets[id]);
          });
        }
      }
    }
    ops.forEach((op) => op());
    return widget.id;
  }
  _addWidget(widget: WebloomWidget) {
    this.widgets[widget.id] = widget;
  }
  getWidgetById(id: string) {
    return this.widgets[id];
  }
  get rootWidget() {
    return this.widgets[EDITOR_CONSTANTS.ROOT_NODE_ID];
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
  get isDragging() {
    return this.draggedWidgetId !== null;
  }
  get isResizing() {
    return this.resizedWidgetId !== null;
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
      this.widgets[nodeId].dispose();
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
        const entity = this.getWidgetById(parent.id);
        const originalParentCoords = this.moveWidgetIntoGrid(parent.id, {
          rowsCount:
            entity.layoutMode === 'fixed'
              ? undefined
              : parent.rowsCount + newParentRowCount,
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
    };
  }

  snapshotWidgets() {
    return Object.values(this.widgets).map((widget) => widget.snapshot);
  }
  dispose(): void {
    Object.values(this.widgets).forEach((widget) => widget.dispose());
    this.cursorManager.dispose();
  }
}
