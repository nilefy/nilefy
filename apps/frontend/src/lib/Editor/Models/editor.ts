import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  toJS,
  autorun,
} from 'mobx';
import { WebloomPage } from './page';
import { WebloomQuery } from './query';
import { EvaluationContext } from '../evaluation';
import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { analyzeDependancies } from '../dependancyUtils';
import { Entity } from './entity';
import { seedNameMap } from '../widgetName';
import { RuntimeEvaluable } from './interfaces';
import _ from 'lodash';

export class EditorState {
  inited: boolean = false;
  pages: Record<string, WebloomPage> = {};
  queries: Record<string, WebloomQuery> = {};
  currentPageId: string = '';
  dependencyManager: DependencyManager = new DependencyManager({
    editor: this,
  });
  evaluationManger: EvaluationManager = new EvaluationManager(this);

  constructor() {
    makeObservable(this, {
      pages: observable,
      queries: observable,
      currentPageId: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
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
    pages: pages = [],
    currentPageId = '',
    queries,
  }: {
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
    console.log('init');
    this.cleanUp();
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
        evaluationManger: this.evaluationManger,
        dependencyManager: this.dependencyManager,
      });
    });
    // analyze dependancies
    const allDependencies: Array<DependencyRelation> = [];
    // analyze widgets props to create the initial graph
    Object.values(this.currentPage.widgets).forEach((widget) => {
      const toBeEvaled = toJS(widget.propsToBeEvaluated);
      const stringProps = this.PropertiesToArray(
        toBeEvaled,
        (v) => typeof v === 'string',
      );
      for (const prop of stringProps) {
        const value = _.get(toBeEvaled, prop);
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
    // analyze queries props to create the initial graph
    Object.values(this.queries).forEach((query) => {
      const toBeEvaled = toJS(query.propsToBeEvaluated);
      const stringProps = this.PropertiesToArray(
        toBeEvaled,
        (v) => typeof v === 'string',
      );
      for (const prop of stringProps) {
        const value = _.get(toBeEvaled, prop);
        const { dependencies, isCode } = analyzeDependancies(
          value,
          prop,
          query.id,
          this.context,
        );
        if (isCode) {
          this.evaluationManger.setRawValueIsCode(query.id, prop, true);
          allDependencies.push(...dependencies);
        }
      }
    });
    this.dependencyManager.addDependencies(allDependencies);
    autorun(() =>
      console.log(
        'deps',
        toJS(this.dependencyManager.getDirectDependencies('post1')),
      ),
    );
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

  getEntityById(id: string): RuntimeEvaluable | undefined {
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
