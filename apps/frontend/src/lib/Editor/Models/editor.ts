import { makeObservable, observable, action, computed, comparer } from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EvaluationContext } from '../evaluation';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { analyzeDependancies } from '../dependancyUtils';
import { Entity } from './entity';
import { seedNameMap } from '../widgetName';
import _ from 'lodash';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

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
      'dependencyManager' | 'evaluationManger'
    >[];
  }) {
    this.cleanUp();
    this.name = name;
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
      });
    });
    // analyze dependancies
    const allDependencies: Array<DependencyRelation> = [];
    Object.values({ ...this.currentPage.widgets, ...this.queries }).forEach(
      (entity) => {
        const toBeEvaled = entity.rawValues;
        // string props are the only ones worth analyzing
        const stringProps = this.PropertiesToArray(
          toBeEvaled,
          (v) => typeof v === 'string',
        );
        for (const prop of stringProps) {
          const value = _.get(toBeEvaled, prop);
          const { dependencies, isCode } = analyzeDependancies(
            value,
            prop,
            entity.id,
            this.context,
          );
          if (isCode) {
            this.evaluationManger.setRawValueIsCode(entity.id, prop, true);
            allDependencies.push(...dependencies);
          }
        }
      },
    );

    this.dependencyManager.addDependencies(allDependencies);
  }
  private createPathFromStack(stack: string[]) {
    return stack.join('.');
  }

  private isObject(val: unknown): val is Record<string, unknown> {
    return _.isPlainObject(val);
  }

  /**
   * return a list of all keys in object, could choose key based on condition
   * @NOTE: the condition will only be called on types that don't match `this.isObject`
   */
  private PropertiesToArray(
    obj: Record<string, unknown>,
    condition: (value: unknown) => boolean = () => true,
  ): string[] {
    const stack: string[] = [];
    const result: string[] = [];
    // the actual function that do the recursion
    const helper = (
      obj: Record<string, unknown>,
      stack: string[],
      result: string[],
    ) => {
      for (const k in obj) {
        stack.push(k);
        const item = obj[k];
        if (this.isObject(item)) {
          helper(item, stack, result);
        } else if (condition(item)) {
          result.push(this.createPathFromStack(stack));
        }
        stack.pop();
      }
    };
    helper(obj, stack, result);
    return result;
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
