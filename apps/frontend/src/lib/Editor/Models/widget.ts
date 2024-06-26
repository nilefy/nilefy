import { makeObservable, observable, computed, action, override } from 'mobx';
import { NilefyWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { getNewEntityName } from '@/lib/Editor/entitiesNameSeed';
import scrollIntoView from 'scroll-into-view-if-needed';

import { WebloomPage } from './page';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import {
  WebloomGridDimensions,
  WebloomPixelDimensions,
  LayoutMode,
  WIDGET_SECTIONS,
  EntityInspectorConfig,
  ResizeDirection,
} from '../interface';
import {
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
} from '../utils';

import { Snapshotable, WebloomDisposable } from './interface';
import { debounce, reduce } from 'lodash';
import { klona } from 'klona';
import { Entity } from './entity';
import { commandManager } from '@/actions/CommandManager';
import { ChangePropAction } from '@/actions/editor/changeProps';
import { EntityActionConfig } from '../evaluation/interface';
const defaultWidgetActions: EntityActionConfig<WebloomWidget> = {
  scrollIntoView: {
    type: 'SIDE_EFFECT',
    name: 'scrollIntoView',
    fn: (entity: WebloomWidget) => {
      scrollIntoView(entity.dom!, {
        scrollMode: 'if-needed',
        skipOverflowHiddenElements: true,
        behavior: 'smooth',
        block: 'center',
      });
    },
  },
};

const normalizeWidgetActions = (actions: EntityActionConfig<WebloomWidget>) => {
  return { ...defaultWidgetActions, ...actions };
};
export class WebloomWidget
  extends Entity
  implements
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomWidget>[0],
        'page' | 'evaluationManger' | 'dependencyManager'
      > & {
        pageId: string;
      }
    >,
    WebloomDisposable
{
  isRoot = false;
  /**
   * @description This is the runtime connection to the thing the widget can do like focus, submit, etc. Widgets have to set this up themselves because the api is
   * different for each widget
   * @example
   * ```
   *  widget.api.focus()
   * ```
   */
  api: Record<string, (...args: unknown[]) => void> = {};
  dom: HTMLElement | null;
  nodes: string[];
  parentId: string;
  type: WidgetTypes;
  col: number;
  row: number;
  columnsCount: number;
  rowsCount: number;
  page: WebloomPage;
  metaProps: Set<string>;
  widgetName: string;
  constructor({
    type,
    parentId,
    row = 0,
    col = 0,
    page,
    id = getNewEntityName(type, page.id),
    nodes = [],
    rowsCount,
    columnsCount,
    props,
  }: {
    type: WidgetTypes;
    parentId: string;
    page: WebloomPage;
    row?: number;
    col?: number;
    id?: string;
    nodes?: string[];
    rowsCount?: number;
    columnsCount?: number;
    props?: Record<string, unknown>;
  }) {
    const widgetConfig = NilefyWidgets[type];
    const _props = props ?? widgetConfig.initialProps;
    const rawValues = {
      ..._props,
      layoutMode: widgetConfig.config.layoutConfig.layoutMode,
    };
    super({
      workerBroker: page.workerBroker,
      id,
      rawValues,
      inspectorConfig: widgetConfig.inspectorConfig as EntityInspectorConfig,
      entityType: 'widget',
      publicAPI: widgetConfig.publicAPI,
      // @ts-expect-error fda
      entityActionConfig: normalizeWidgetActions(
        widgetConfig.config.widgetActions ?? {},
      ),
      metaValues: widgetConfig.metaProps,
    });
    this.widgetName = id;
    this.metaProps = widgetConfig.metaProps ?? new Set();
    if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) this.isRoot = true;
    this.dom = null;
    this.nodes = nodes;
    this.parentId = parentId;
    this.page = page;
    this.type = type;
    this.rowsCount = rowsCount ?? widgetConfig.config.layoutConfig.rowsCount;
    this.columnsCount =
      columnsCount ?? widgetConfig.config.layoutConfig.colsCount;
    this.row = row;
    this.col = col;
    makeObservable(this, {
      nodes: observable,
      parentId: observable,
      dom: observable.ref,
      type: observable,
      col: observable,
      row: observable,
      columnsCount: observable,
      rowsCount: observable,
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
      setValue: override,
      innerRowsCount: computed,
      actualRowsCount: computed,
      innerContainerDimensions: computed,
      innerContainerPixelDimensions: computed,
      isSelected: computed,
      isDragging: computed,
      isResizing: computed,
      isHovered: computed,
      isVisible: computed,
      isTheOnlySelected: computed,
      resizeDirection: computed,
      layoutMode: computed,
      descendants: computed,
      childrenHasSelected: computed,
      unselectSelf: action,
    });
  }
  get childrenHasSelected(): boolean {
    if (this.nodes.length === 0) return this.isTheOnlySelected;
    return (
      this.nodes.some((node) => this.page.widgets[node].childrenHasSelected) ||
      this.isTheOnlySelected
    );
  }
  get descendants(): string[] {
    if (this.nodes.length === 0) return [];
    return [
      ...this.nodes.flatMap((node) => this.page.widgets[node].descendants),
      ...this.nodes,
    ];
  }
  get resizeDirection(): ResizeDirection {
    const direction = NilefyWidgets[this.type].config.resizingDirection;
    if (this.layoutMode === 'auto' && direction === 'Both') return 'Horizontal';
    return direction;
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
  setValue(path: string, value: unknown, autoSync = true): void {
    if (!this.metaProps.has(path) && autoSync) {
      this.debouncedSyncRawValuesWithServer();
    }
    super.setValue(path, value);
  }
  syncRawValuesWithServer() {
    commandManager.executeCommand(new ChangePropAction(this.id));
  }
  debouncedSyncRawValuesWithServer = debounce(
    this.syncRawValuesWithServer,
    500,
  );
  setApi(api: Record<string, (...args: unknown[]) => void>) {
    this.api = api;
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
    } else return this.rowsCount;
  }
  setDom(dom: HTMLElement) {
    this.dom = dom;
  }
  get scrollableContainer(): HTMLDivElement | null {
    if (this.isCanvas) return this.getDomSection(WIDGET_SECTIONS.SCROLL_AREA);
    return this.canvasParent.scrollableContainer;
  }
  get resizer(): HTMLDivElement | null {
    return this.getDomSection(WIDGET_SECTIONS.RESIZER);
  }

  get canvas(): HTMLDivElement | null {
    return this.getDomSection(WIDGET_SECTIONS.CANVAS);
  }

  getDomSection(section: keyof typeof WIDGET_SECTIONS) {
    return this.dom?.querySelector(
      `[data-type="${section}"]`,
    ) as HTMLDivElement;
  }

  get layoutMode() {
    return this.getValue('layoutMode') as LayoutMode;
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
  get isHovered() {
    return this.page.hoveredWidgetId === this.id;
  }
  get isVisible() {
    return !this.isDragging;
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
      props: reduce(
        klona(this.rawValues),
        (acc, value, key) => {
          if (this.metaProps.has(key)) return acc;
          acc[key] = value;
          return acc;
        },
        {} as Record<string, unknown>,
      ),
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
  get scrollTop() {
    return this.scrollableContainer?.scrollTop ?? 0;
  }
  get cumlativScrollTop(): number {
    if (this.isRoot) return this.scrollTop;
    return this.scrollTop + this.canvasParent.cumlativScrollTop;
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

  get parent() {
    return this.page.widgets[this.parentId];
  }

  get canvasParent(): WebloomWidget {
    if (this.isRoot) return this;
    const parent = this.parent;
    if (parent.isCanvas) return parent;
    return parent.canvasParent;
  }
  get isTheOnlySelected() {
    return this.page.selectedNodeIds.size === 1 && this.isSelected;
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
    snapshot.id = getNewEntityName(snapshot.type, this.page.id);
    return new WebloomWidget({
      ...snapshot,
      page: this.page,
    });
  }

  get isCanvas() {
    return NilefyWidgets[this.type].config.isCanvas;
  }
  unselectSelf() {
    this.page.setSelectedNodeIds((prev) => {
      return new Set([...prev].filter((i) => i !== this.id));
    });
  }

  dispose() {
    this.unselectSelf();
    super.dispose();
  }
}
