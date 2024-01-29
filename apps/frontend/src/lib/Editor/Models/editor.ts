import { makeObservable, observable, action, computed, comparer } from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EvaluationContext } from '../evaluation';
import { WebloomWidget } from './widget';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { analyzeDependancies } from '../dependancyUtils';

export type WebloomEntity = WebloomWidget | WebloomQuery;
export class EditorState {
  pages: Record<string, WebloomPage> = {};
  queries: Record<string, WebloomQuery> = {};
  currentPageId: string = '';
  dependencyManager!: DependencyManager;
  evaluationManger!: EvaluationManager;

  constructor() {
    makeObservable(this, {
      pages: observable,
      currentPageId: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
      currentPage: computed,
      changePage: action,
      addPage: action,
      removePage: action,
      init: action,
    });
  }

  init({
    pages: pages = [],
    currentPageId = '',
    queries,
  }: {
    pages: Omit<
      ConstructorParameters<typeof WebloomPage>[0],
      'dependencyManager' | 'evaluationManger'
    >[];
    currentPageId: string;
    queries: ConstructorParameters<typeof WebloomQuery>[0][];
  }) {
    console.log('init');
    pages.forEach((page) => {
      this.pages[page.id] = new WebloomPage({
        ...page,
        evaluationManger: this.evaluationManger,
        dependencyManager: this.dependencyManager,
      });
    });
    this.currentPageId = currentPageId;
    if (pages.length === 0) {
      this.addPage('page1');
      this.currentPageId = 'page1';
    }
    if (!this.currentPageId) {
      this.currentPageId = Object.keys(this.pages)[0];
    }
    queries.forEach((q) => {
      this.queries[q.id] = new WebloomQuery({
        ...q,
      });
    });

    this.dependencyManager = new DependencyManager({
      editor: this,
    });
    this.evaluationManger = new EvaluationManager(this);
    // analyze dependancies
    const allDependencies: Array<DependencyRelation> = [];
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

  getEntityById(id: string): WebloomEntity | undefined {
    return this.currentPage.widgets[id] || this.queries[id];
  }

  get currentPage() {
    return this.pages[this.currentPageId];
  }

  changePage(id: string) {
    if (!this.pages[id]) {
      this.addPage(id);
      this.currentPageId = id;
    } else {
      this.currentPageId = id;
    }
  }
  addPage(id: string) {
    this.pages[id] = new WebloomPage({
      id,
      widgets: {},
      dependencyManager: this.dependencyManager,
      evaluationManger: this.evaluationManger,
    });
  }

  removePage(id: string) {
    delete this.pages[id];
  }

  snapshot() {
    return {
      pages: Object.values(this.pages).map((page) => page.snapshot),
      currentPageId: this.currentPageId,
    };
  }
}
