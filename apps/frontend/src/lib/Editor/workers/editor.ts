import { makeObservable, observable, action, computed, comparer } from 'mobx';
import { Entity } from './entity';
import { DependencyManager } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { AddEntityRequest, EntityConfigBody } from './common/interface';
import { EvaluationContext } from '../evaluation';
import { EDITOR_CONSTANTS } from '@webloom/constants';
export type EntityConfig = ConstructorParameters<typeof Entity>[0];
type EntityConfigRecord = Record<string, EntityConfigBody>;
export class EditorState {
  pages: Record<string, Record<string, Entity>> = {};
  queries: Record<string, Entity> = {};
  currentPageId: string = '';
  dependencyManager: DependencyManager;
  evaluationManager: EvaluationManager;
  constructor() {
    makeObservable(this, {
      pages: observable,
      queries: observable,
      currentPageId: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
      entities: computed,
      currentPage: computed,
      changePage: action,
      addPage: action,
      addQuery: action,
      removeQuery: action,
      removePage: action,
      addWidget: action,
      cleanUp: action,
      removeWidget: action,
      init: action,
      addEntity: action,
      removeEntity: action,
    });
    this.dependencyManager = new DependencyManager({ editor: this });
    this.evaluationManager = new EvaluationManager(this);
  }

  cleanUp() {
    this.pages = {};
    this.queries = {};
    this.currentPageId = '';
    this.dependencyManager = new DependencyManager({ editor: this });
    this.evaluationManager = new EvaluationManager(this);
  }

  init({
    currentPageId,
    queries,
    pages,
  }: {
    currentPageId: string;
    queries: Record<string, EntityConfigBody>;
    pages: Record<string, Record<string, EntityConfigBody>>;
  }) {
    this.currentPageId = currentPageId;
    Object.entries(queries).forEach(([_, query]) => {
      this.addQuery({
        ...query,
        dependencyManager: this.dependencyManager,
      });
    });
    Object.entries(pages).forEach(([pageId, widgets]) => {
      this.addPage({ pageId, widgets });
    });
    this.dependencyManager.initAnalysis();
  }

  get context() {
    const context: EvaluationContext = {};
    Object.values(this.currentPage).forEach((widget) => {
      context[widget.id] = widget.unevalValues;
    });
    Object.values(this.queries).forEach((query) => {
      context[query.id] = query.unevalValues;
    });
    return context;
  }

  get entities() {
    return {
      ...this.currentPage,
      ...this.queries,
    };
  }

  getEntityById(id: string) {
    return this.currentPage[id] || this.queries[id];
  }

  addPage({
    pageId,
    widgets,
  }: {
    pageId: string;
    widgets: EntityConfigRecord;
  }) {
    this.pages[pageId] ||= {};
    Object.entries(widgets).forEach(([id, widget]) => {
      this.pages[pageId][id] = new Entity({
        ...widget,
        dependencyManager: this.dependencyManager,
      });
    });
  }

  addWidget(config: EntityConfig) {
    if (!this.currentPage) return;
    if (
      config.id === EDITOR_CONSTANTS.ROOT_NODE_ID ||
      config.id === EDITOR_CONSTANTS.PREVIEW_NODE_ID
    )
      return;
    this.currentPage[config.id] ||= new Entity(config);
  }
  get currentPage() {
    return this.pages[this.currentPageId];
  }
  addQuery(config: EntityConfig) {
    this.queries[config.id] = new Entity(config);
  }
  removeWidget(id: string) {
    delete this.currentPage[id];
  }
  removeQuery(id: string) {
    delete this.queries[id];
  }
  removePage(id: string) {
    delete this.pages[id];
  }
  removeEntity(id: string) {
    if (this.currentPage[id]) {
      this.removeWidget(id);
    } else {
      this.removeQuery(id);
    }
  }
  addEntity(body: AddEntityRequest['body']) {
    if (body.entityType === 'query') {
      this.addQuery({
        ...body.config,
        dependencyManager: this.dependencyManager,
      });
    } else {
      this.addWidget({
        ...body.config,
        dependencyManager: this.dependencyManager,
      });
    }
  }
  changePage(id: string) {
    this.currentPageId = id;
  }
}
