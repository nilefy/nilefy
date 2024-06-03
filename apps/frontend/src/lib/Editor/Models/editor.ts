import { QueryClient } from '@tanstack/query-core';
import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  toJS,
  runInAction,
} from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EntityConfigBody, WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import { WebloomDisposable } from './interface';
import { QueriesManager } from './queriesManager';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { EvaluationContext } from '../evaluation/interface';
import { WebloomGlobal } from './webloomGlobal';
import { Diff } from 'deep-diff';
import { Entity } from './entity';
import {
  getNewEntityName,
  seedOrderMap,
  updateOrderMap,
} from '../entitiesNameSeed';
import { entries, values } from 'lodash';
import { WebloomJSQuery } from './jsQuery';
import { JSLibrary } from './jsLibrary';
import { defaultLibrariesMeta } from '../libraries';
import {
  createJSLibrary,
  deleteJSLibrary,
  JSLibraryI,
  updateJSLibrary,
} from '@/api/JSLibraries.api';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type BottomPanelMode = 'query' | 'debug';
export class EditorState implements WebloomDisposable {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  queryPanel!: {
    addMenuOpen: boolean;
  };
  initPromise!: Promise<void>;
  resolveInit!: () => void;
  rejectInit!: (e: Error) => void;
  queries: Record<string, WebloomQuery | WebloomJSQuery> = {};
  globals: WebloomGlobal | undefined = undefined;
  libraries: Record<string, JSLibrary> = {};
  workerBroker!: WorkerBroker;
  currentPageId: string = '';
  initting = false;
  queryClient!: QueryClient;
  queriesManager!: QueriesManager;
  appId!: number;
  workspaceId!: number;
  selectedQueryId: string | null = null;
  bottomPanelMode: BottomPanelMode = 'query';
  /**
   * application name
   */
  name: string = 'New Application';
  onBoardingCompleted: boolean = false;
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
      queryPanel: observable,
      applyEvalForestPatch: action.bound,
      applyEntityToEntityDependencyPatch: action.bound,
      currentPageErrors: computed,
      currentPageErrorsCount: computed,
      selectedQueryId: observable,
      setSelectedQueryId: action,
      bottomPanelMode: observable,
      setBottomPanelMode: action,
      libraries: observable,
      installLibrary: action,
      updateLibraryName: action,
      uninstallLibrary: action,
      setQueryPanelAddMenuOpen: action,
    });
  }

  setQueryPanelAddMenuOpen(open: boolean) {
    this.queryPanel.addMenuOpen = open;
  }

  setBottomPanelMode(mode: BottomPanelMode) {
    this.bottomPanelMode = mode;
  }
  setSelectedQueryId(
    idOrCb: string | null | ((prev: string | null) => string | null),
  ) {
    if (typeof idOrCb === 'function') {
      this.selectedQueryId = idOrCb(this.selectedQueryId);
    } else {
      this.selectedQueryId = idOrCb;
    }
  }
  applyEntityToEntityDependencyPatch(
    lastEntityToEntityDependencyUpdates: Record<string, Diff<any>[]>,
  ) {
    entries(lastEntityToEntityDependencyUpdates).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyDependencyUpdatePatch(op);
      }
    });
  }

  applyEvalForestPatch(
    lastEvalUpdates: Record<string, Diff<any>[]>,
    lastRunTimeErrors: Record<string, Diff<any>[]>,
    lastValidationErrors: Record<string, Diff<any>[]>,
  ) {
    entries(lastEvalUpdates).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyEvalationUpdatePatch(op);
      }
    });
    entries(lastRunTimeErrors).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyErrorUpdatePatch(op, 'runtimeErrors');
      }
    });
    entries(lastValidationErrors).forEach(([id, op]) => {
      const entity = this.getEntityById(id);
      if (entity) {
        entity.applyErrorUpdatePatch(op, 'evaluationValidationErrors');
      }
    });
  }
  dispose() {
    Object.values(this.pages).forEach((page) => page.dispose());
    Object.values(this.queries).forEach((query) => query.dispose());
    this.globals = undefined;
    this.workerBroker?.dispose();
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
    jsQueries = [],
    appId,
    workspaceId,
    currentUser,
    jsLibraries = [],
    onBoardingCompleted,
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
    jsQueries: Omit<
      ConstructorParameters<typeof WebloomJSQuery>[0],
      'workerBroker' | 'queryClient' | 'workspaceId'
    >[];
    jsLibraries: JSLibraryI[];
    appId: number;
    workspaceId: number;
    currentUser: string;
    onBoardingCompleted: boolean;
  }) {
    try {
      this.initPromise = new Promise((resolve, reject) => {
        this.resolveInit = resolve;
        this.rejectInit = reject;
      });
      this.dispose();
      this.workerBroker = new WorkerBroker(this);
      this.queryPanel = {
        addMenuOpen: false,
      };
      this.appId = appId;
      this.workspaceId = workspaceId;
      this.name = name;
      this.onBoardingCompleted = onBoardingCompleted;
      this.libraries = entries(defaultLibrariesMeta).reduce(
        (acc, [name, lib]) => {
          acc[name] = new JSLibrary(lib);
          return acc;
        },
        {} as Record<string, JSLibrary>,
      );
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
        ...jsQueries.map((q) => {
          return {
            type: EDITOR_CONSTANTS.JS_QUERY_BASE_NAME,
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
      jsQueries.forEach((q) => {
        this.queries[q.id] = new WebloomJSQuery({
          ...q,
          queryClient: this.queryClient,
          workerBroker: this.workerBroker,
          appId,
          workspaceId,
        });
      });
      jsLibraries.forEach((lib) => {
        this.libraries[lib.id] = new JSLibrary({
          availabeAs: lib.id,
          isDefault: false,
          name: lib.id,
          url: lib.url,
        });
      });
      this.workerBroker.postMessegeInBatch({
        event: 'init',
        body: {
          currentPageId: this.currentPageId,
          libraries: jsLibraries,
          globals: {
            unevalValues: this.globals.rawValues,
            id: this.globals.id,
            inspectorConfig: this.globals.inspectorConfig,
            publicAPI: this.globals.publicAPI,
            actionsConfig: this.globals.rawActionsConfig,
            metaValues: this.globals.metaValues,
          },
          queries: Object.values(this.queries).reduce(
            (acc, query) => {
              acc[query.id as string] = {
                unevalValues: query.rawValues,
                id: query.id,
                inspectorConfig: query.inspectorConfig,
                publicAPI: query.publicAPI,
                actionsConfig: query.rawActionsConfig,
                metaValues: query.metaValues,
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
                  metaValues: widget.metaValues,
                };
                return acc;
              },
              {} as Record<string, EntityConfigBody>,
            ),
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * kinda of hook after the worker init the application(after first evaluation cycle)
   *
   * could be used for things that needs app to be inited first like running queries
   */
  afterInit() {
    Object.values(this.queries).forEach((q) => {
      if (q.triggerMode === 'onAppLoad') void q.run();
    });
    this.resolveInit();
  }
  // TODO: add support for queries
  get currentPageErrors() {
    const errors: Record<string, InstanceType<typeof Entity>['errors']> = {};
    entries(this.entities).forEach(([id, entity]) => {
      if (!entity) return;
      errors[id] = entity.errors;
    });
    return errors;
  }
  get currentPageErrorsCount() {
    let count = 0;
    for (const entityErrors of Object.values(this.currentPageErrors)) {
      for (const errorType of values(entityErrors)) {
        count += values(toJS(errorType)).reduce(
          (acc, curr) => acc + curr.length,
          0,
        );
      }
    }
    return count;
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
    this.workerBroker.postMessegeInBatch({
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
      'workerBroker' | 'queryClient' | 'appId' | 'workspaceId'
    >,
  ) {
    this.queries[query.id] = new WebloomQuery({
      ...query,
      appId: this.appId,
      workspaceId: this.workspaceId,
      workerBroker: this.workerBroker,
      queryClient: this.queryClient,
    });
  }
  addJSQuery(
    query: Omit<
      ConstructorParameters<typeof WebloomJSQuery>[0],
      'workerBroker' | 'queryClient' | 'workspaceId'
    >,
  ) {
    this.queries[query.id] = new WebloomJSQuery({
      ...query,
      appId: this.appId,
      workspaceId: this.workspaceId,
      workerBroker: this.workerBroker,
      queryClient: this.queryClient,
    });
  }
  removePage(id: string) {
    delete this.pages[id];
  }
  removeQuery(id: string) {
    const query = this.queries[id];
    const type =
      query instanceof WebloomQuery ? query.dataSource.name : query.entityType;
    updateOrderMap(
      [
        {
          type: type,
          name: id,
        },
      ],
      true,
    );
    query.dispose();
    delete this.queries[id];
  }
  uninstallLibrary(id: string) {
    delete this.libraries[id];
    this.workerBroker.postMessegeInBatch({
      event: 'uninstallLibrary',
      body: {
        id,
      },
    });
    // todo handle update server state gracefully
    deleteJSLibrary({
      workspaceId: this.workspaceId,
      appId: this.appId,
      libraryId: id,
    });
  }
  updateLibraryName(id: string, newName: string) {
    const lib = this.libraries[id];
    delete this.libraries[id];
    this.libraries[newName] = lib;
    this.libraries[newName].name = newName;
    this.libraries[newName].availabeAs = newName;
    this.workerBroker.postMessegeInBatch({
      event: 'updateLibraryName',
      body: {
        id,
        newName,
      },
    });
    // todo handle update server state gracefully
    updateJSLibrary({
      workspaceId: this.workspaceId,
      appId: this.appId,
      libraryId: id,
      dto: {
        id: newName,
      },
    });
  }
  async installLibrary(url: string) {
    try {
      const jsLib = await this.workerBroker.installLibrary(url);
      const name = getNewEntityName(jsLib.name);
      if (jsLib.name !== name) {
        this.workerBroker.postMessegeInBatch({
          event: 'updateLibraryName',
          body: {
            id: jsLib.name,
            newName: name,
          },
        });
        jsLib.name = name;
        jsLib.availabeAs = name;
      }
      // todo handle update server state gracefully
      await createJSLibrary({
        appId: this.appId,
        workspaceId: this.workspaceId,
        dto: {
          id: jsLib.name,
          url: jsLib.url,
        },
      });
      runInAction(() => {
        this.libraries[jsLib.name] = new JSLibrary(jsLib);
      });
      return {
        isSuccess: true,
        library: jsLib,
      };
    } catch (e) {
      // todo better way to check the type of the error
      if (
        e instanceof Error &&
        e.message === 'Library install request timed out'
      ) {
        return {
          isSuccess: false,
          isError: true,
          error: new Error('Library install request timed out'),
        };
      }
      return {
        isSuccess: false,
        error: e,
      };
    }
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
