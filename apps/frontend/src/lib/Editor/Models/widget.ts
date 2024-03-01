import { makeObservable, observable, computed, action } from 'mobx';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { Point, WidgetSnapshot } from '@/types';
import { WebloomPage } from './page';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  LayoutMode,
  WebloomGridDimensions,
  WebloomPixelDimensions,
} from '../interface';
import {
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
  isPointInsideBoundingRect,
} from '../utils';

import { RuntimeEvaluable, Snapshotable } from './interfaces';
import { DependencyRelation } from './dependencyManager';
import { cloneDeep, get } from 'lodash';

export type RuntimeProps = Record<string, unknown>;
type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;

export class WebloomWidget
  implements Snapshotable<WidgetSnapshot>, RuntimeEvaluable
{
  isRoot = false;
  id: string;
  dom: HTMLElement | null;
  nodes: string[];
  parentId: string;
  rawValues: RuntimeProps;
  type: WidgetTypes;
  col: number;
  row: number;
  columnsCount: number;
  rowsCount: number;
  page: WebloomPage;
  constructor({
    type,
    parentId,
    row,
    col,
    page,
    id = getNewWidgetName(type),
    nodes = [],
    rowsCount,
    columnsCount,
    props,
  }: {
    type: WidgetTypes;
    parentId: string;
    page: WebloomPage;
    row: number;
    col: number;
    id?: string;
    nodes?: string[];
    rowsCount?: number;
    columnsCount?: number;
    props?: Record<string, unknown>;
    dependents?: Set<string>;
  }) {
    this.id = id;
    if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) this.isRoot = true;
    this.dom = null;
    this.nodes = nodes;
    this.parentId = parentId;
    this.page = page;
    this.type = type;
    const { config, defaultProps } = WebloomWidgets[type];
    this.rowsCount = rowsCount ?? config.layoutConfig.rowsCount;
    this.columnsCount = columnsCount ?? config.layoutConfig.colsCount;
    this.row = row;
    this.col = col;
    this.rawValues = {};
    if (config.layoutConfig.layoutMode) {
      this.rawValues['layoutMode'] = config.layoutConfig.layoutMode;
    }
    if (!props) {
      props = {};
    }
    if (props) {
      Object.keys(props).forEach((key) => {
        this.rawValues[key] =
          props[key] ?? defaultProps[key as keyof typeof defaultProps];
      });
    }

    makeObservable(this, {
      rawValues: observable,
      values: computed.struct,
      nodes: observable,
      parentId: observable,
      dom: observable.ref,
      id: observable,
      type: observable,
      col: observable,
      row: observable,
      columnsCount: observable,
      rowsCount: observable,
      setProp: action,
      setDimensions: action,
      gridSize: computed.struct,
      selfGridSize: computed.struct,
      boundingRect: computed.struct,
      setDom: action,
      pixelDimensions: computed.struct,
      relativePixelDimensions: computed.struct,
      gridDimensions: computed.struct,
      addChild: action,
      canvasParent: computed,
      columnWidth: computed,
      removeSelf: action,
      parent: computed,
      isRoot: observable,
      gridBoundingRect: computed.struct,
      removeChild: action,
      addDependencies: action,
      clearDependents: action,
      cleanup: action,
      innerRowsCount: computed,
      actualRowsCount: computed,
      innerContainerDimensions: computed,
      innerContainerPixelDimensions: computed,
      isSelected: computed,
      isDragging: computed,
      isResizing: computed,
      isHovered: computed,
    });
  }
  /**
   *
   * @param mousePos
   * @returns true if the mouse is inside the widget and does not collide with any of its children and the widget is not being dragged
   */
  checkMouseCollisionShallow(mousePos: Point) {
    if (this.isDragging) return false;
    if (!this.isCanvas) {
      const mouseWithScroll = {
        x: mousePos.x,
        y: mousePos.y + this.cumlativScrollTop - this.page.rootWidget.scrollTop,
      };
      if (isPointInsideBoundingRect(mouseWithScroll, this.boundingRect)) {
        console.log('collided with', this.id);
        return true;
      }
    }
    const boundingRect = this.boundingRect;
    if (isPointInsideBoundingRect(mousePos, boundingRect)) {
      const mousePosWithScroll = {
        x: mousePos.x,
        y: mousePos.y + this.cumlativScrollTop - this.page.rootWidget.scrollTop,
      };
      for (const node of this.nodes) {
        const child = this.page.widgets[node];
        if (child.isDragging) continue;
        const childBoundingRect = child.boundingRect;
        if (isPointInsideBoundingRect(mousePosWithScroll, childBoundingRect)) {
          console.log(this.id, child.id, 'collided');
          return false;
        }
      }
      return true;
    }
    return false;
  }
  get scrollTop() {
    return this.scrollableContainer?.scrollTop ?? 0;
  }
  get isHovered() {
    return this.page.hoveredWidgetId === this.id;
  }
  get cumlativScrollTop(): number {
    if (this.isRoot) return this.scrollTop;
    return this.scrollTop + this.canvasParent.cumlativScrollTop;
  }
  get columnWidth(): number {
    if (this.isRoot)
      // flooring to avoid floating point errors and because integers are just nice
      return Math.floor(this.page.width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS);
    if (this.isCanvas)
      return Math.max(
        Math.floor(
          this.pixelDimensions.width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        ),
        2,
      );
    return 0;
  }
  get boundingRect() {
    return getBoundingRect(this.pixelDimensions);
  }
  get gridBoundingRect() {
    return getGridBoundingRect(this.gridDimensions);
  }
  get innerRowsCount() {
    let min = 0;
    if (this.layoutMode === 'auto') {
      min = 20;
    } else {
      min = this.rowsCount;
    }
    return this.nodes.reduce((prev, cur) => {
      return Math.max(
        prev,
        this.page.widgets[cur].row + this.page.widgets[cur].rowsCount,
      );
    }, min);
  }

  get actualRowsCount() {
    if (this.layoutMode === 'auto') {
      return this.innerRowsCount;
      // NOTE: this depends on `handleVerticalExpansion` will not inc rowsCount in the fixed case
    } else return this.rowsCount;
  }
  setDom(dom: HTMLElement) {
    this.dom = dom;
  }
  get scrollableContainer(): HTMLDivElement | undefined {
    if (this.isCanvas)
      // this is an implementation detail, the scrollable container is the parent of the parent of the canvas
      // in radix scrollable areas
      return this.dom?.parentElement?.parentElement as HTMLDivElement;
    return this.canvasParent.scrollableContainer as HTMLDivElement;
  }
  getProp(key: string) {
    return this.values[key] ?? this.rawValues[key];
  }

  get layoutMode() {
    return this.getProp('layoutMode') as LayoutMode;
  }
  get isSelected() {
    return this.page.selectedNodeIds.has(this.id);
  }
  get isDragging() {
    return this.page.draggedWidgetId === this.id;
  }
  get isResizing() {
    return this.page.resizedWidgetId === this.id;
  }

  get values(): EvaluatedRunTimeProps {
    const evaluatedProps: EvaluatedRunTimeProps = {};
    for (const key in this.rawValues) {
      const path = this.id + '.' + key;
      const evaluatedValue = get(
        this.page.evaluationManger.evaluatedForest,
        path,
      );
      if (evaluatedValue !== undefined) {
        evaluatedProps[key] = evaluatedValue;
      }
    }
    return {
      ...this.rawValues,
      ...evaluatedProps,
    };
  }
  /**
   *
   * @returns a snapshot of the widget that can be used to recreate the widget, all computed properties are omitted. this can also be sent to the server to save the widget
   */
  get snapshot() {
    return {
      id: this.id,
      nodes: [...this.nodes],
      pageId: this.page.id,
      parentId: this.parentId,
      columnWidth: this.columnWidth,
      props: cloneDeep(this.rawValues),
      type: this.type,
      col: this.col,
      row: this.row,
      columnsCount: this.columnsCount,
      rowsCount: this.rowsCount,
    };
  }

  setDimensions(dimensions: Partial<WebloomGridDimensions>) {
    this.row = dimensions.row ?? this.row;
    this.col = dimensions.col ?? this.col;
    this.columnsCount = dimensions.columnsCount ?? this.columnsCount;
    this.rowsCount = dimensions.rowsCount ?? this.rowsCount;
  }

  get pixelDimensions(): WebloomPixelDimensions {
    if (this.isRoot) {
      return {
        x: 0,
        y: 0,
        width: Math.round(
          this.columnWidth! * EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        ),
        height: this.rowsCount * EDITOR_CONSTANTS.ROW_HEIGHT,
      };
    }
    return convertGridToPixel(
      this.gridDimensions,
      this.gridSize as [number, number],
      this.canvasParent.pixelDimensions,
    );
  }
  /**
   * returns the outer height
   */
  get relativePixelDimensions(): WebloomPixelDimensions {
    if (this.isRoot) return this.pixelDimensions;
    return convertGridToPixel(
      this.gridDimensions,
      this.gridSize as [number, number],
      { x: 0, y: 0 },
    );
  }

  get gridDimensions(): WebloomGridDimensions {
    return {
      row: this.row,
      col: this.col,
      columnsCount: this.columnsCount,
      rowsCount: this.actualRowsCount,
    };
  }
  get innerContainerDimensions() {
    return {
      row: this.row,
      col: this.col,
      columnsCount: this.columnsCount,
      rowsCount: this.innerRowsCount,
    };
  }

  get innerContainerPixelDimensions() {
    return convertGridToPixel(
      this.innerContainerDimensions,
      this.gridSize as [number, number],
      this.canvasParent.pixelDimensions,
    );
  }

  setProp(key: string, value: unknown) {
    if (key === 'id') {
      this.page.widgets[value as string] = this;
      delete this.page.widgets[this.id];
    }
    this.rawValues[key] = value;
  }

  get parent() {
    return this.page.widgets[this.parentId];
  }

  get canvasParent(): WebloomWidget {
    if (this.isRoot) return this;
    const parent = this.parent;
    if (parent.isCanvas) return parent;
    return parent.canvasParent;
  }

  addChild(nodeId: string) {
    this.nodes.push(nodeId);
    this.nodes.sort((a, b) => {
      const aNode = this.page.widgets[a].row;
      const bNode = this.page.widgets[b].row;
      return -aNode + bNode;
    });
    const node = this.page.widgets[nodeId];
    node.parentId = this.id;
  }

  get gridSize(): [number, number] {
    return this.canvasParent.selfGridSize;
  }
  get selfGridSize(): [number, number] {
    return [EDITOR_CONSTANTS.ROW_HEIGHT, this.columnWidth];
  }

  removeSelf() {
    this.page.removeWidget(this.id);
  }

  removeChild(id: string) {
    this.nodes = this.nodes.filter((node) => node !== id);
  }

  clone() {
    const snapshot = this.snapshot;
    snapshot.id = getNewWidgetName(snapshot.type);
    return new WebloomWidget({ ...snapshot, page: this.page });
  }

  get isCanvas() {
    return WebloomWidgets[this.type].config.isCanvas;
  }

  setPropIsCode(key: string, isCode: boolean) {
    this.page.evaluationManger.setRawValueIsCode(this.id, key, isCode);
  }

  addDependencies(relations: Array<DependencyRelation>) {
    this.page.dependencyManager.addDependenciesForEntity(relations, this.id);
  }

  clearDependents() {
    this.page.dependencyManager.removeRelationshipsForEntity(this.id);
  }

  cleanup() {
    this.clearDependents();
  }
}
