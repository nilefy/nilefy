import { QueryClient } from '@tanstack/query-core';
import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  toJS,
} from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EntityConfigBody, WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import { WebloomDisposable } from './interfaces';
import { QueriesManager } from './queriesManager';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { EvaluationContext } from '../evaluation/interface';
import { Operation } from 'fast-json-patch';
import { WebloomGlobal } from './webloomGlobal';

import { Entity } from './entity';
import { seedOrderMap, updateOrderMap } from '../entitiesNameSeed';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export class EditorState implements WebloomDisposable {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  queries: Record<string, WebloomQuery> = {};
  globals: WebloomGlobal | undefined = undefined;
  workerBroker: WorkerBroker;
  currentPageId: string = '';
  initting = false;
  queryClient!: QueryClient;
  queriesManager!: QueriesManager;
  appId!: number;
  workspaceId!: number;
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
      entities: computed,
      name: observable,
      currentPage: computed,
      changePage: action,
      addPage: action,
      addQuery: action,
      removeQuery: action,
      removePage: action,
      init: action,
      applyEvalForestPatch: action.bound,
      currentPageErrors: computed,
    });
    this.workerBroker = new WorkerBroker(this);
  }
  applyEvalForestPatch(
    lastEvalUpdates: Record<string, Operation[]>,
    lastErrorUpdates: Record<string, Operation[]>,
  ) {
    Object.entries(lastEvalUpdates).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyEvalationUpdatePatch(op);
        const errors = lastErrorUpdates[id];
        if (errors) {
          entity.applyErrorUpdatePatch(errors);
        }
      }
    });
  }
  dispose() {
    Object.values(this.pages).forEach((page) => page.dispose());
    Object.values(this.queries).forEach((query) => query.dispose());
    this.globals = undefined;
    // react strict mode causes this to be called twice
    process.env.NODE_ENV === 'production' ? this.workerBroker.dispose() : null;
    this.pages = {};
    this.queries = {};
    this.currentPageId = '';
    this.queryClient?.clear();
    this.appId = -1;
    this.workspaceId = -1;
  }

  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
    queries = [],
    appId,
    workspaceId,
    currentUser,
  }: {
    name: string;
    pages: Optional<
      Omit<ConstructorParameters<typeof WebloomPage>[0], 'workerBroker'>,
      'widgets'
    >[];
    currentPageId: string;
    queries: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'workerBroker' | 'queryClient' | 'workspaceId'
    >[];
    appId: number;
    workspaceId: number;
    currentUser: string;
  }) {
    this.dispose();
    this.appId = appId;
    this.workspaceId = workspaceId;
    this.name = name;
    this.queryClient = new QueryClient();
    this.queriesManager = new QueriesManager(this.queryClient, this);
    this.globals = new WebloomGlobal({
      globals: {
        currentPageName: currentPageId,
        currentUser,
      },
      workerBroker: this.workerBroker,
    });

    seedOrderMap([
      ...Object.values(pages[0].widgets || {}).map((w) => {
        return {
          type: w.type,
          name: w.id,
        };
      }),
      ...queries.map((q) => {
        return {
          type: q.dataSource.name,
          name: q.id,
        };
      }),
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
        appId,
        workspaceId,
      });
    });
    this.workerBroker.postMessege({
      event: 'init',
      body: {
        currentPageId: this.currentPageId,
        globals: {
          unevalValues: this.globals.rawValues,
          id: this.globals.id,
          inspectorConfig: this.globals.inspectorConfig,
          publicAPI: this.globals.publicAPI,
          actionsConfig: this.globals.rawActionsConfig,
        },
        queries: Object.values(this.queries).reduce(
          (acc, query) => {
            acc[query.id as string] = {
              unevalValues: query.rawValues,
              id: query.id,
              inspectorConfig: query.inspectorConfig,
              publicAPI: query.publicAPI,
              actionsConfig: query.rawActionsConfig,
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
                actionsConfig: widget.rawActionsConfig,
              };
              return acc;
            },
            {} as Record<string, EntityConfigBody>,
          ),
        },
      },
    });
  }

  // TODO: add support for queries
  get currentPageErrors() {
    const res: { entityId: string; path: string; error: string }[] = [];

    return res;
  }

  /**
   * @description returns the evaluation context for the page. This is used to give autocomplete suggestions.
   */
  get context() {
    const context: EvaluationContext = {};
    Object.values(this.entities).forEach((entity) => {
      if (!entity) return;
      if (entity.id === EDITOR_CONSTANTS.ROOT_NODE_ID) return;
      context[entity.id] = entity.finalValues;
    });
    return context;
  }

  getEntityById(id: string): Entity | undefined {
    return this.entities[id as keyof typeof this.entities];
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
    updateOrderMap(
      [
        {
          type: this.queries[id].dataSource.name,
          name: id,
        },
      ],
      true,
    );
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
      [EDITOR_CONSTANTS.GLOBALS_ID]: this.globals,
    };
  }
}
