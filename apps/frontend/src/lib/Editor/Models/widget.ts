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
import { Dependable, Snapshotable } from './interfaces';
import { WebloomQuery } from './query';
import { EntityDependents } from './entityDependents';

export type RuntimeProps = Map<
  string,
  {
    value: unknown;
    isCode: boolean;
  }
>;
type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;
type ToProperty = string;
export type SnapshotDependencies = {
  relations: Array<DependencyRelation>;
};
export type DependencyRelation = {
  to: ToProperty;
  on: {
    entityId: string;
    props?: Array<string>;
  };
};
export class WebloomWidget
  implements
    Snapshotable<
      Omit<ConstructorParameters<typeof WebloomWidget>[0], 'page'> & {
        pageId: string;
      }
    >,
    Dependable
{
  isRoot = false;
  id: string;
  dom: HTMLElement | null;
  nodes: string[];
  parentId: string;
  props: RuntimeProps;
  dependencies: WidgetDependencies;
  dependents: EntityDependents;
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
    dependencies,
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
    dependencies?: SnapshotDependencies;
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
    this.props = new Map();
    if (!props) {
      props = {};
    }
    if (props) {
      Object.keys(props).forEach((key) => {
        this.props.set(key, {
          value: props[key] ?? defaultProps[key as keyof typeof defaultProps],
          isCode: false,
        });
      });
    }
    this.dependencies = new WidgetDependencies(dependencies);
    this.dependents = new EntityDependents(new Set());
    makeObservable(this, {
      props: observable,
      evaluatedProps: computed,
      dependencies: observable,
      dependents: observable,
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
      codeProps: computed,
      setIsPropCode: action,
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
    return this.evaluatedProps[key] ?? this.props.get(key)?.value;
  }
  get evaluatedProps(): EvaluatedRunTimeProps {
    const localEvaluationContext: EvaluationContext = {
      widgets: {},
      queries: {},
    };
    const evaluatedProps: EvaluatedRunTimeProps = {};
    for (const item of this.dependencies.relations) {
      const relations = item[1];
      for (const relation of relations) {
        const entityId = relation[0];
        const entity = this.page.getEntityById(entityId);
        if (!entity) {
          throw new Error(`entity with id ${entityId} not found`);
        }
        if (entity instanceof WebloomQuery) {
          localEvaluationContext.queries[entity.id] ||= {};
          localEvaluationContext.queries[entity.id] = entity.value;
        }
        if (entity instanceof WebloomWidget) {
          const onProps = relation[1];
          if (!onProps) {
            throw new Error(
              `props not found for relation with entity ${entity.id}`,
            );
          }
          for (const prop of onProps) {
            localEvaluationContext.widgets[entity.id] ||= {};
            localEvaluationContext.widgets[entity.id][prop] =
              entity.getProp(prop);
          }
        }
      }
    }
    for (const prop of this.props) {
      if (prop[1].isCode) {
        evaluatedProps[prop[0]] = evaluate(
          prop[1].value as string,
          localEvaluationContext,
        );
      } else {
        evaluatedProps[prop[0]] = prop[1].value;
      }
    }
    return evaluatedProps;
  }
  /**
   *
   * @returns a snapshot of the widget that can be used to recreate the widget, all computed properties are omitted. this can also be sent to the server to save the widget
   */
  get snapshot() {
    const props: SnapshotProps = {};
    this.props.forEach((prop, key) => {
      props[key] = prop.value;
    });
    return {
      id: this.id,
      nodes: [...this.nodes],
      pageId: this.page.id,
      parentId: this.parentId,
      columnWidth: this.columnWidth,
      props: props,
      dependencies: this.dependencies.snapshot(),
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

  get codeProps() {
    const codeProp: Record<string, unknown> = {};
    for (const [key, value] of this.props) {
      if (value.isCode) {
        codeProp[key] = value.value;
      }
    }
    return codeProp;
  }
  isPropCode(key: string) {
    return !!this.codeProps[key];
  }

  setProp(key: string, value: unknown) {
    if (key === 'id') {
      this.page.widgets[value as string] = this;
      delete this.page.widgets[this.id];
    }
    this.props.set(key, {
      isCode: !!this.props.get(key)?.isCode,
      value,
    });
  }
  setIsPropCode(key: string, isCode: boolean) {
    this.props.set(key, {
      isCode,
      value: this.props.get(key)?.value,
    });
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
  addDependencies(relations: Array<DependencyRelation>) {
    for (const relation of relations) {
      const onEntity = this.page.getEntityById(relation.on.entityId);
      if (!onEntity) return;
      this.dependencies.createRelation(relation);
      onEntity.dependents.addDependent(this.id);
    }
  }

  clearDependents() {
    const dependents = this.dependents.dependents;
    for (const dependent of dependents) {
      const dependentWidget = this.page.getWidgetById(dependent)!;
      dependentWidget.dependencies.deleteByEntity(this.id);
    }
  }

  cleanup() {
    this.clearDependents();
  }
}
type OnEntityId = string;
type OnProp = string;
export class WidgetDependencies {
  // Observable array to store relations
  relations: Map<ToProperty, Map<OnEntityId, Set<OnProp>>> = new Map();

  constructor(snapshot?: SnapshotDependencies) {
    if (snapshot) {
      for (const relation of snapshot.relations) {
        this.createRelation(relation);
      }
    }
    // this.cleanup = autorun
    makeObservable(this, {
      relations: observable,
      createRelation: action,
      deleteByOnProp: action,
      deleteByToProperty: action,
      deleteByEntity: action,
    });
  }
  createRelation(relation: DependencyRelation) {
    if (!this.relations.has(relation.to)) {
      this.relations.set(relation.to, new Map());
    }
    const relations = this.relations.get(relation.to)!;
    if (!relations.has(relation.on.entityId)) {
      relations.set(relation.on.entityId, new Set());
    }
    const props = relations.get(relation.on.entityId)!;
    if (relation.on.props) {
      for (const prop of relation.on.props) {
        props.add(prop);
      }
    }
  }
  deleteByOnProp(toProperty: ToProperty, entityId: OnEntityId, prop: OnProp) {
    const relations = this.relations.get(toProperty);
    if (!relations) return;
    const props = relations.get(entityId);
    if (!props) return;
    props.delete(prop);
    if (props.size === 0) {
      relations.delete(entityId);
    }
    if (relations.size === 0) {
      this.deleteByToProperty(toProperty);
    }
  }
  deleteByToProperty(toProperty: ToProperty) {
    this.relations.delete(toProperty);
  }

  deleteByEntity(entityId: OnEntityId) {
    for (const relation of this.relations) {
      const relations = relation[1];
      if (relations.has(entityId)) {
        relations.delete(entityId);
      }
    }
    for (const relation of this.relations) {
      if (relation[1].size === 0) {
        this.relations.delete(relation[0]);
      }
    }
  }
  snapshot(): SnapshotDependencies {
    const snapshot: SnapshotDependencies = {
      relations: [],
    };
    for (const relation of this.relations) {
      const toProperty = relation[0];
      const relations = relation[1];
      for (const relation of relations) {
        const onEntityId = relation[0];
        const props = relation[1];
        snapshot.relations.push({
          to: toProperty,
          on: {
            entityId: onEntityId,
            props: [...props],
          },
        });
      }
    }
    return snapshot;
  }
}
