import { makeObservable, observable, action, computed, comparer } from 'mobx';
import { Entity } from './entity';
import { DependencyManager } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { AddEntityRequest, EntityConfigBody } from './common/interface';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { AnalysisContext } from '../dependancyUtils';
import { MainThreadBroker } from './mainThreadBroker';
import { entries } from 'lodash';
export type EntityConfig = ConstructorParameters<typeof Entity>[0];
type EntityConfigRecord = Record<string, EntityConfigBody>;
// The worker maintains its version of the state
// They are kept in sync by autorunners
// The worker is responsible for evaluation, widget events, and dependency analysis
// as usually these tend to be the most expensive operations
export class EditorState {
  pages: Record<string, Record<string, Entity>> = {};
  queries: Record<string, Entity> = {};
  currentPageId: string = '';
  dependencyManager: DependencyManager;
  evaluationManager: EvaluationManager;
  mainThreadBroker: MainThreadBroker;
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
    this.mainThreadBroker = new MainThreadBroker(this);
  }

  cleanUp() {
    this.pages = {};
    this.queries = {};
    this.currentPageId = '';
    this.dependencyManager = new DependencyManager({ editor: this });
    this.evaluationManager = new EvaluationManager(this);
    this.mainThreadBroker = new MainThreadBroker(this);
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
    entries(queries).forEach(([_, query]) => {
      this.addQuery(this.normalizeEntityConfig(query));
    });
    entries(pages).forEach(([pageId, widgets]) => {
      this.addPage({ pageId, widgets });
    });
    this.dependencyManager.initAnalysis();
  }

  get context() {
    const context: AnalysisContext = {};
    entries(this.entities).forEach(([id, entity]) => {
      context[id] = entity.publicAPI;
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
      this.pages[pageId][id] = new Entity(this.normalizeEntityConfig(widget));
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
      this.addQuery(this.normalizeEntityConfig(body.config));
    } else {
      this.addWidget(this.normalizeEntityConfig(body.config));
    }
  }
  normalizeEntityConfig(config: EntityConfigBody) {
    return {
      ...config,
      dependencyManager: this.dependencyManager,
      mainThreadBroker: this.mainThreadBroker,
    };
  }
  changePage(id: string) {
    this.currentPageId = id;
  }
}
