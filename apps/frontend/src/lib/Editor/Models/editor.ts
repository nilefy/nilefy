import { QueryClient } from '@tanstack/query-core';
import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  autorun,
  toJS,
} from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EvaluationContext, evaluateCode } from '../evaluation';
import { DependencyManager } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { Entity } from './entity';
import { seedOrderMap, updateOrderMap } from '../widgetName';
import { ErrorSchema } from '@rjsf/utils';
import {
  EventTypes,
  WidgetsEventHandler,
} from '@/components/rjsf_shad/eventHandler';
import { toast } from '@/components/ui/use-toast';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export class EditorState {
  /**
   * @description [id]: page
   */
  pages: Record<string, WebloomPage> = {};
  queries: Record<string, WebloomQuery> = {};
  currentPageId: string = '';
  dependencyManager: DependencyManager = new DependencyManager({
    editor: this,
  });
  evaluationManger: EvaluationManager = new EvaluationManager(this);
  /**
   * application name
   */
  name: string = 'New Application';
  appId!: number;
  workspaceId!: number;

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
      currentPageErrors: computed,
    });
  }

  cleanUp() {
    this.pages = {};
    this.queries = {};
    this.currentPageId = '';
    this.dependencyManager = new DependencyManager({
      editor: this,
    });
    this.evaluationManger = new EvaluationManager(this);
  }

  init({
    name = 'New Application',
    pages: pages = [],
    currentPageId = '',
    queries = [],
    queryClient,
    appId,
    workspaceId,
  }: {
    appId: number;
    workspaceId: number;
    queryClient: QueryClient;
    name: string;
    pages: Optional<
      Omit<
        ConstructorParameters<typeof WebloomPage>[0],
        'dependencyManager' | 'evaluationManger'
      >,
      'widgets'
    >[];
    currentPageId: string;
    queries: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'dependencyManager' | 'evaluationManger' | 'workspaceId'
    >[];
  }) {
    this.cleanUp();
    WebloomQuery.queryClient = queryClient;
    this.name = name;
    this.appId = appId;
    this.workspaceId = workspaceId;
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
        evaluationManger: this.evaluationManger,
        dependencyManager: this.dependencyManager,
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
        evaluationManger: this.evaluationManger,
        dependencyManager: this.dependencyManager,
        workspaceId: workspaceId,
      });
    });
    this.dependencyManager.initAnalysis();
  }

  // TODO: add support for queries
  get currentPageErrors() {
    const res: { entityId: string; path: string; error: string }[] = [];
    for (const w in this.currentPage.widgets) {
      const widget = this.currentPage.getWidgetById(w);
      if (!widget || widget.isRoot) continue;
      const errors = widget.validationErrors;
      if (!errors) continue;
      Object.entries(errors).map(([key, err]) => {
        res.push({
          entityId: widget.id,
          path: key,
          error: (err as ErrorSchema).__errors?.join(' '),
        });
      });
    }
    return res;
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
  }

  addPage(id: string, name: string, handle: string) {
    this.pages[id] = new WebloomPage({
      id,
      name,
      handle,
      dependencyManager: this.dependencyManager,
      evaluationManger: this.evaluationManger,
      widgets: {},
    });
  }

  addQuery(
    query: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'dependencyManager' | 'evaluationManger' | 'queryClient'
    >,
  ) {
    this.queries[query.id] = new WebloomQuery({
      ...query,
      dependencyManager: this.dependencyManager,
      evaluationManger: this.evaluationManger,
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
    };
  }

  /**
   * @param type the name of the event you want to run handlers for(must match the name you configured to eventManager)
   * @param key where to get the handlers configuration
   * @default 'events'
   */
  executeActions<Events extends object>(
    widgetId: string,
    type: keyof Events,
    key: string = 'events',
  ) {
    const eventHandlers = this.currentPage.getWidgetById(widgetId).finalValues[
      key
    ] as WidgetsEventHandler;
    if (!eventHandlers) return;
    eventHandlers.forEach((handler) => {
      if (handler.type === type) {
        this.executeActionHelper(handler.config);
      }
    });
  }

  private executeActionHelper(actionConfig: WidgetsEventHandler[0]['config']) {
    switch (actionConfig.type) {
      case 'alert':
        {
          toast({
            description: actionConfig.message,
            variant:
              actionConfig.messageType === 'failure'
                ? 'destructive'
                : 'default',
          });
        }
        break;
      case 'openLink':
        {
          window.open(actionConfig.link, '_blank');
        }
        break;
      case 'runScript':
        {
          // TODO: i don't think this way to create context is too performant, try improving it
          const evaluationContext: EvaluationContext = {};
          Object.entries(this.currentPage.widgets).forEach(
            ([widgetName, widget]) => {
              evaluationContext[widgetName] = {
                ...widget.finalValues,
                ...widget.setters,
              };
            },
          );
          Object.entries(this.queries).forEach(([queryName, query]) => {
            evaluationContext[queryName] = {
              ...query.finalValues,
              run: () =>
                query.runQuery.mutate({
                  workspaceId: this.workspaceId,
                  appId: this.appId,
                  queryId: query.id,
                  body: {
                    evaluatedConfig: toJS(query.config) as Record<
                      string,
                      unknown
                    >,
                  },
                }),
            };
          });
          evaluateCode(actionConfig.script, evaluationContext);
        }
        break;
      default:
        throw new Error("don't know this type");
    }
  }
}
