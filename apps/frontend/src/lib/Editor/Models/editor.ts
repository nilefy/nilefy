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
import { EvaluationContext } from '../evaluation';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { analyzeDependancies } from '../dependancyUtils';
import { Entity } from './entity';
import { seedNameMap } from '../widgetName';

export class EditorState {
  inited: boolean = false;
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
  }: {
    name: string;
    pages: Omit<
      ConstructorParameters<typeof WebloomPage>[0],
      'dependencyManager' | 'evaluationManger'
    >[];
    currentPageId: string;
    queries: Omit<
      ConstructorParameters<typeof WebloomQuery>[0],
      'dependencyManager' | 'evaluationManger'
    >[];
  }) {
    this.cleanUp();
    this.name = name;
    seedNameMap([
      ...Object.values(pages[0].widgets).map((w) => w.type),
      ...queries.map((q) => q.dataSource.name),
    ]);
    // create resources needed for the editor
    pages.forEach((page) => {
      this.pages[page.id] = new WebloomPage({
        ...page,
        evaluationManger: this.evaluationManger,
        dependencyManager: this.dependencyManager,
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
      });
    });
    // analyze dependancies
    const allDependencies: Array<DependencyRelation> = [];
    // analyze widgets props to create the initial graph
    Object.values(this.currentPage.widgets).forEach((widget) => {
      for (const prop in widget.rawValues) {
        const value = widget.rawValues[prop];
        const { dependencies, isCode } = analyzeDependancies(
          value,
          prop,
          widget.id,
          this.context,
        );
        if (isCode) {
          this.evaluationManger.setRawValueIsCode(widget.id, prop, true);
          allDependencies.push(...dependencies);
        }
      }
    });

    this.dependencyManager.addDependencies(allDependencies);
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
      'dependencyManager' | 'evaluationManger'
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
    delete this.queries[id];
  }

  snapshot() {
    return {
      pages: Object.values(this.pages).map((page) => page.snapshot),
      currentPageId: this.currentPageId,
    };
  }
}
