import { makeObservable, observable, computed, action } from 'mobx';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { getNewWidgetName } from '@/lib/Editor/widgetName';
import { EvaluationContext, evaluate } from '../evaluation';
import { Point } from '@/types';
import { WebloomPage } from './page';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { WebloomGridDimensions, WebloomPixelDimensions } from '../interface';
import {
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
  normalize,
} from '../utils';
import {
  handleHoverCollision,
  handleLateralCollisions,
  handleParentCollisions,
} from '../collisions';
import { RuntimeEvaluable, Snapshotable } from './interfaces';
import { DependencyRelation } from './dependencyManager';
import { cloneDeep, get } from 'lodash';

export type RuntimeProps = Record<string, unknown>;
type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;
type bluePrintType = Parameters<
  InstanceType<typeof WebloomPage>['addWidget']
>[0];
export class WebloomWidget
  implements
    Snapshotable<
      Omit<ConstructorParameters<typeof WebloomWidget>[0], 'page'> & {
        pageId: string;
      }
    >,
    RuntimeEvaluable
{
  isRoot = false;
  id: string;
  dom: HTMLElement | null;
  nodes: string[];
  bluePrint: bluePrintType[];
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
    bluePrint = [],
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
    bluePrint?: bluePrintType[];
    rowsCount?: number;
    columnsCount?: number;
    props?: Record<string, unknown>;
    dependents?: Set<string>;
  }) {
    this.id = id;
    if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) this.isRoot = true;
    this.dom = null;
    this.nodes = nodes;
    this.bluePrint = bluePrint;
    this.parentId = parentId;
    this.page = page;
    this.type = type;
    const { config, defaultProps } = WebloomWidgets[type];
    this.rowsCount = rowsCount ?? config.layoutConfig.rowsCount;
    this.columnsCount = columnsCount ?? config.layoutConfig.colsCount;
    this.row = row;
    this.col = col;
    this.rawValues = {};
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
      dom: observable,
      id: observable,
      type: observable,
      col: observable,
      row: observable,
      columnsCount: observable,
      rowsCount: observable,
      setProp: action,
      setDimensions: action,
      gridSize: computed.struct,
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
    });
  }
  get columnWidth(): number {
    if (this.isRoot)
      return this.page.width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
    if (this.isCanvas)
      return this.pixelDimensions.width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
    return 0;
  }
  get boundingRect() {
    return getBoundingRect(this.pixelDimensions);
  }
  get gridBoundingRect() {
    return getGridBoundingRect(this.gridDimensions);
  }
  setDom(dom: HTMLElement) {
    this.dom = dom;
  }

  getProp(key: string) {
    return this.values[key] ?? this.rawValues[key];
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
      rowsCount: this.rowsCount,
    };
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
    console.log(this, 'lll');
    if (parent.isCanvas) return parent;
    return parent.canvasParent;
  }

  addChild(nodeId: string) {
    console.log(nodeId, 'bla');
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
    const parent = this.canvasParent;
    return [EDITOR_CONSTANTS.ROW_HEIGHT, parent.columnWidth!];
  }

  getDropCoordinates(
    startPosition: Point,
    delta: Point,
    overId: string,
    draggedId: string,
    forShadow = false,
  ) {
    const mousePos = this.page.mousePosition;
    const [gridrow, gridcol] = this.gridSize as [number, number];
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };
    const newPosition = {
      x: startPosition.x + normalizedDelta.x,
      y: startPosition.y + normalizedDelta.y,
    }; // -> this is the absolute position in pixels (normalized to the grid)
    const overEl = this.page.getWidgetById(overId);
    const parent = this.canvasParent;
    const parentBoundingRect = parent.boundingRect;
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
      columnsCount: this.columnsCount,
      rowsCount: this.rowsCount,
    };

    if (overId !== EDITOR_CONSTANTS.ROOT_NODE_ID && overId !== draggedId) {
      dimensions = handleHoverCollision(
        dimensions,
        parent.pixelDimensions,
        overEl.boundingRect,
        [gridrow, gridcol],
        !!overEl.isCanvas,
        mousePos,
        forShadow,
      );
    }
    dimensions = handleLateralCollisions(
      this.id,
      overId,
      draggedId,
      parent.nodes,
      dimensions,
      mousePos,
    );
    dimensions = handleParentCollisions(
      dimensions,
      parent.pixelDimensions,
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
