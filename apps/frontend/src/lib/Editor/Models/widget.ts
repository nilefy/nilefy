import { makeObservable, observable, computed, action, override } from 'mobx';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';
import { getNewEntityName } from '@/lib/Editor/entitiesNameSeed';
import { WebloomPage } from './page';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  WebloomGridDimensions,
  WebloomPixelDimensions,
  LayoutMode,
  WIDGET_SECTIONS,
  EntityInspectorConfig,
} from '../interface';
import {
  convertGridToPixel,
  getBoundingRect,
  getGridBoundingRect,
} from '../utils';

import { Snapshotable, WebloomDisposable } from './interfaces';
import { debounce } from 'lodash';
import { klona } from 'klona';
import { Entity } from './entity';
import { commandManager } from '@/actions/CommandManager';
import { ChangePropAction } from '@/actions/Editor/changeProps';
import { EntityActionConfig } from '../evaluation/interface';
const defaultWidgetActions: EntityActionConfig<WebloomWidget> = {
  scrollIntoView: {
    type: 'SIDE_EFFECT',
    name: 'scrollIntoView',
    fn: (entity: WebloomWidget) => {
      entity.dom?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
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
  constructor({
    type,
    parentId,
    row,
    col,
    page,
    id = getNewEntityName(type),
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
  }) {
    const widgetConfig = WebloomWidgets[type];

    super({
      workerBroker: page.workerBroker,
      id,
      rawValues:
        { ...props, layoutMode: widgetConfig.config.layoutConfig.layoutMode } ??
        {},
      inspectorConfig: widgetConfig.inspectorConfig as EntityInspectorConfig,
      entityType: 'widget',
      publicAPI: widgetConfig.publicAPI,
      // @ts-expect-error fda
      entityActionConfig: normalizeWidgetActions(
        widgetConfig.config.widgetActions ?? {},
      ),
    });
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
    });
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
  setValue(path: string, value: unknown): void {
    this.debouncedSyncRawValuesWithServer();
    super.setValue(path, value);
  }
  setApi(api: Record<string, (...args: unknown[]) => void>) {
    this.api = api;
  }
  syncRawValuesWithServer() {
    commandManager.executeCommand(new ChangePropAction(this.id));
  }
  debouncedSyncRawValuesWithServer = debounce(
    this.syncRawValuesWithServer,
    500,
  );
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
      props: klona(this.rawValues),
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
    snapshot.id = getNewEntityName(snapshot.type);
    return new WebloomWidget({
      ...snapshot,
      page: this.page,
    });
  }

  handleEvent(event: string) {
    if (!this.rawValues[event]) return;
    this.workerBroker.postMessege({
      event: 'eventExecution',
      body: {
        eventName: event,
        id: this.id,
      },
    });
  }
  get isCanvas() {
    return WebloomWidgets[this.type].config.isCanvas;
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
