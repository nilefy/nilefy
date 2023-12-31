import { makeObservable, observable, computed, action } from 'mobx';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { getNewWidgetName } from '@/store/widgetName';
import { WebloomQuery } from './query';
import { EvaluationContext, evaluate } from '../evaluation';
import { Point } from '@/types';
import { Page } from './page';
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
import { cloneDeep } from 'lodash';
import { Snapshotable } from './interfaces';
// type EntityDependancy =

export class WebloomWidget
  implements
    Snapshotable<
      Omit<ConstructorParameters<typeof WebloomWidget>[0], 'page'> & {
        page: string;
      }
    >
{
  isRoot = false;
  id: string;
  dom: HTMLElement | null;
  nodes: string[];
  parentId: string;
  columnWidth?: number;
  isCanvas?: boolean;
  props: Record<string, unknown>;
  dependancies: Record<string, Set<WebloomWidget | WebloomQuery>>;
  type: WidgetTypes;
  col: number;
  row: number;
  columnsCount: number;
  rowsCount: number;
  page: Page;
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
    dependancies,
  }: {
    type: WidgetTypes;
    parentId: string;
    page: Page;
    row: number;
    col: number;
    id?: string;
    nodes?: string[];
    rowsCount?: number;
    columnsCount?: number;
    props?: Record<string, unknown>;
    dependancies?: Record<string, Set<WebloomWidget | WebloomQuery>>;
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
    this.props = props ?? { ...defaultProps };
    this.dependancies = dependancies ?? {};
    makeObservable(this, {
      props: observable,
      dependancies: observable,
      nodes: observable,
      parentId: observable,
      dom: observable,
      id: observable,
      type: observable,
      col: observable,
      row: observable,
      columnsCount: observable,
      rowsCount: observable,
      dynamicProps: computed.struct,
      setProp: action,
      setDimensions: action,
      gridSize: computed.struct,
      boundingRect: computed.struct,
      setDom: action,
      pixelDimensions: computed.struct,
    });
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

  /**
   *
   * @returns a snapshot of the widget that can be used to recreate the widget, all computed properties are omitted. this can also be sent to the server to save the widget
   */
  get snapshot() {
    return cloneDeep({
      id: this.id,
      nodes: this.nodes,
      page: this.page.id,
      parentId: this.parentId,
      columnWidth: this.columnWidth,
      isCanvas: this.isCanvas,
      props: this.props,
      dependancies: this.dependancies,
      type: this.type,
      col: this.col,
      row: this.row,
      columnsCount: this.columnsCount,
      rowsCount: this.rowsCount,
    });
  }

  setDimensions(dimensions: Partial<WebloomGridDimensions>) {
    this.row = dimensions.row || this.row;
    this.col = dimensions.col || this.col;
    this.columnsCount = dimensions.columnsCount || this.columnsCount;
    this.rowsCount = dimensions.rowsCount || this.rowsCount;
    this.columnWidth = dimensions.columnWidth || this.columnWidth;
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
      columnWidth: this.columnWidth,
    };
  }

  get dynamicProps(): typeof this.props {
    const dynamicProps = { ...this.props };
    // loop over all the dependancies and evaluate the code
    Object.keys(this.dependancies).forEach((key) => {
      const dependancy = this.dependancies[key];
      const context: EvaluationContext = {
        widgets: {},
        queries: {},
      };
      dependancy.forEach((entity) => {
        if (entity instanceof WebloomWidget) {
          context.widgets[entity.id] = entity.dynamicProps;
        } else if (entity instanceof WebloomQuery) {
          context.queries[entity.id] = entity.value;
        }
      });
      const value = evaluate(key, context);
      dynamicProps[key] = value;
    });
    return dynamicProps;
  }

  setProp(key: string, value: unknown) {
    this.props[key] = value;
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
  }

  get gridSize() {
    const parent = this.canvasParent;
    return [EDITOR_CONSTANTS.ROW_HEIGHT, parent.columnWidth];
  }

  getDropCoordinates(
    startPosition: Point,
    delta: Point,
    overId: string,
    draggedId: string,
    mousePos: Point,
    forShadow = false,
  ) {
    const tree = this.page.widgets;
    const [gridrow, gridcol] = this.gridSize as [number, number];
    const normalizedDelta = {
      x: normalize(delta.x, gridcol),
      y: normalize(delta.y, gridrow),
    };
    const newPosition = {
      x: startPosition.x + normalizedDelta.x,
      y: startPosition.y + normalizedDelta.y,
    }; // -> this is the absolute position in pixels (normalized to the grid)
    const parent = tree[this.parentId];
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
    const overEl = tree[overId];
    if (overId !== EDITOR_CONSTANTS.ROOT_NODE_ID && overId !== draggedId) {
      dimensions = handleHoverCollision(
        dimensions,
        parent.pixelDimensions,
        overEl.boundingRect,
        [gridrow, gridcol],
        !!overEl.isCanvas!,
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
}
