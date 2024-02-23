import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  toJS,
  reaction,
} from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EvaluationContext } from '../evaluation';
import { Entity } from './entity';
import { seedNameMap } from '../widgetName';
import { EntityConfigBody, WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import { WebloomDisposable } from './interfaces';
import { QueryClient } from '@tanstack/query-core';
import { QueriesManager } from './queriesManager';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export class EditorState implements WebloomDisposable {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  queries: Record<string, WebloomQuery> = {};
  workerBroker: WorkerBroker;
  currentPageId: string = '';
  initting = false;
  queryClient!: QueryClient;
  queriesManager!: QueriesManager;
  /**
   * application name
   */
  name: string = 'New Application';

  constructor() {
    makeObservable(this, {
      pages: observable,
      queries: observable,
      currentPageId: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
      name: observable,
      currentPage: computed,
      changePage: action,
      addPage: action,
      addQuery: action,
      removeQuery: action,
      removePage: action,
      init: action,
      applyEvalForestPatch: action.bound,
    });
    this.workerBroker = new WorkerBroker();
    reaction(
      () => this.workerBroker.lastEvalUpdates,
      this.applyEvalForestPatch,
    );
  }
  applyEvalForestPatch() {
    Object.entries(this.workerBroker.lastEvalUpdates).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyEvalationUpdatePatch(op);
        const errors = this.workerBroker.lastErrorUpdates[id];
        if (errors) {
          entity.applyErrorUpdatePatch(errors);
        }
      }
    });
  }
  dispose() {
    Object.values(this.pages).forEach((page) => page.dispose());
    Object.values(this.queries).forEach((query) => query.dispose());
    // react strict mode causes this to be called twice
    process.env.NODE_ENV === 'production' ? this.workerBroker.dispose() : null;
    this.pages = {};
    this.queries = {};
    this.currentPageId = '';
    this.queryClient?.clear();
  }

  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
    queries = [],
  }: {
    name: string;
    pages: Optional<
      Omit<ConstructorParameters<typeof WebloomPage>[0], 'workerBroker'>,
      'widgets'
    >[];
    currentPageId: string;
    queries: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'workerBroker' | 'queryClient'
    >[];
  }) {
    this.dispose();
    this.name = name;
    this.queryClient = new QueryClient();
    this.queriesManager = new QueriesManager(this.queryClient, this);
    seedNameMap([
      ...Object.values(pages[0].widgets || {}).map((w) => w.type),
      ...queries.map((q) => q.dataSource.name),
    ]);
    // create resources needed for the editor
    pages.forEach((page, index) => {
      // TODO: remove this check
      if (index !== 0) return;
      this.pages[page.id] = new WebloomPage({
        ...page,
        workerBroker: this.workerBroker,
        // Todo fix this
        widgets: page.widgets || {},
      });
    });
    this.currentPageId = currentPageId;
    // NOTE: backend should create page by default
    if (pages.length === 0) {
      this.addPage('page1', 'page1', 'page1');
      this.currentPageId = 'page1';
    }
    if (!this.currentPageId) {
      this.currentPageId = Object.keys(this.pages)[0];
    }
    queries.forEach((q) => {
      this.queries[q.id] = new WebloomQuery({
        ...q,
        queryClient: this.queryClient,
        workerBroker: this.workerBroker,
      });
    });
    this.workerBroker.postMessege({
      event: 'init',
      body: {
        currentPageId: this.currentPageId,
        queries: Object.values(this.queries).reduce(
          (acc, query) => {
            acc[query.id as string] = {
              unevalValues: query.rawValues,
              id: query.id,
              inspectorConfig: query.inspectorConfig,
              publicAPI: query.publicAPI,
            };
            return acc;
          },
          {} as Record<string, EntityConfigBody>,
        ),
        pages: {
          [currentPageId]: Object.entries(this.currentPage.widgets).reduce(
            (acc, [id, widget]) => {
              acc[id] = {
                id: widget.id,
                unevalValues: toJS(widget.rawValues),
                inspectorConfig: widget.inspectorConfig,
                publicAPI: widget.publicAPI,
              };
              return acc;
            },
            {} as Record<string, EntityConfigBody>,
          ),
        },
      },
    });
  }

  /**
   * @description returns the evaluation context for the page. This is used to give autocomplete suggestions.
   */
  get context() {
    const context: EvaluationContext = {};
    Object.values(this.currentPage.widgets).forEach((widget) => {
      if (widget.isRoot) return;
      context[widget.id] = widget.rawValues;
    });
    Object.values(this.queries).forEach((query) => {
      context[query.id] = query.rawValues;
    });
    return context;
  }

  getEntityById(id: string): Entity | undefined {
    return this.currentPage.widgets[id] || this.queries[id];
  }

  get currentPage() {
    return this.pages[this.currentPageId];
  }

  changePage(id: string, name: string, handle: string) {
    if (!this.pages[id]) {
      this.addPage(id, name, handle);
      this.currentPageId = id;
    } else {
      this.currentPageId = id;
    }
    this.workerBroker.postMessege({
      event: 'changePage',
      body: {
        currentPageId: this.currentPageId,
      },
    } as WorkerRequest);
  }

  addPage(id: string, name: string, handle: string) {
    this.pages[id] = new WebloomPage({
      id,
      name,
      handle,
      workerBroker: this.workerBroker,
      widgets: {},
    });
  }
  getQueryById(id: string) {
    return this.queries[id];
  }
  addQuery(
    query: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'workerBroker' | 'queryClient'
    >,
  ) {
    this.queries[query.id] = new WebloomQuery({
      ...query,
      workerBroker: this.workerBroker,
      queryClient: this.queryClient,
    });
  }

  removePage(id: string) {
    delete this.pages[id];
  }

  removeQuery(id: string) {
    delete this.queries[id];
  }

  snapshot() {
    return {
      pages: Object.values(this.pages).map((page) => page.snapshot),
      currentPageId: this.currentPageId,
    };
  }
  get entities() {
    return {
      ...this.currentPage.widgets,
      ...this.queries,
    };
  }
}
