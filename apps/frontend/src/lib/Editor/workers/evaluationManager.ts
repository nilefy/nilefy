import { action, computed, makeObservable, observable } from 'mobx';
import invariant from 'invariant';
import { entries, get, keys, merge, set } from 'lodash';
import { evaluate } from '../evaluation';
import { EditorState } from './editor';
import { analyzeDependancies } from '../evaluation/dependancyUtils';
import { bindingRegexGlobal } from '../evaluation/utils';

export class EvaluationManager {
  editor: EditorState;
  disposables: Array<() => void> = [];
  lastEvaluatedForest: Record<string, unknown> = {};
  constructor(editor: EditorState) {
    makeObservable(this, {
      editor: observable,
      evaluatedForest: computed({
        keepAlive: true,
        requiresReaction: false,
      }),
      settedProps: computed,
      executeEvent: action,
    });
    this.editor = editor;
  }
  static isCode(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const matches = value.match(bindingRegexGlobal);
    if (!matches) return false;
    for (const _ of matches) {
      return !!_;
    }
    return false;
  }
  get settedProps() {
    return entries(this.editor.entities).reduce(
      (acc, [id, entity]) => {
        acc[id] = entity.setterProps;
        return acc;
      },
      {} as Record<string, Record<string, unknown>>,
    );
  }

  executeEvent(entityId: string, code: string) {
    // since events aren't continously evaluated, we extract dependencies on the fly.
    // We'll extract dependencies for actions as well.
    const res = analyzeDependancies({
      code,
      entityId,
      keys: this.editor.context,
      isAction: true,
    });
    if (!res.isCode) return;
    const { dependencies } = res;
    const context: Record<string, unknown> = {};
    for (const item of dependencies) {
      const { entityId, path } = item.dependency;
      const fullPath = `${entityId}.${path}`;
      const entity = this.editor.getEntityById(entityId);
      const value = get(
        this.lastEvaluatedForest,
        fullPath,
        get(entity.unevalValues, path, get(entity.actions, path)),
      );
      set(context, fullPath, value);
    }
    // We don't expect return values from events.
    evaluate(code, context, true);
  }

  /**
   * @description this method evaluates the whole forest of the dependency graph.
   * it shouldn't be used to execute actions or events.
   */
  get evaluatedForest() {
    performance.mark('start-evaluatedForest');
    const sortedGraph = this.editor.dependencyManager.graph;
    const evalTree: Record<string, unknown> = {};
    const runtimeErrors: Record<string, Record<string, string[]>> = {};
    const evaluationValidationErrors: Record<
      string,
      Record<string, string[]>
    > = {};
    const toBeRemoved = new Set<string>();
    const alreadyEvaluated = new Set<string>();
    for (const item of this.editor.dependencyManager.leaves) {
      const [entityId, ...pathArr] = item.split('.');
      const path = pathArr.join('.');
      alreadyEvaluated.add(item);
      const entity = this.editor.getEntityById(entityId);
      const unevalValue = get(entity.unevalValues, path);
      if (EvaluationManager.isCode(unevalValue)) {
        // eslint-disable-next-line
        let { value: evaluatedValue, errors: evaluationErrors } = evaluate(
          unevalValue as string,
          evalTree,
        );
        if (evaluationErrors) {
          runtimeErrors[entityId] = merge({}, runtimeErrors[entityId], {
            [path]: evaluationErrors,
          });
        }
        const res = entity.validatePath(path, evaluatedValue);
        if (res) {
          evaluatedValue = res.value;
          evaluationValidationErrors[entityId] = merge(
            {},
            evaluationValidationErrors[entityId],
            { [path]: res.errors },
          );
        }
        set(evalTree, item, evaluatedValue);
        continue;
      }
      set(evalTree, item, unevalValue);
      toBeRemoved.add(item);
    }

    for (const item of sortedGraph) {
      if (alreadyEvaluated.has(item)) continue;
      const [entityId, ...pathArr] = item.split('.');
      const path = pathArr.join('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${item}`,
      );
      const unevalValue = get(entity.unevalValues, path);
      // eslint-disable-next-line
      let { value: evaluatedValue, errors: evaluationErrors } = evaluate(
        unevalValue as string,
        evalTree,
      );
      if (evaluationErrors) {
        runtimeErrors[entityId] = merge({}, runtimeErrors[entityId], {
          [path]: evaluationErrors,
        });
      }
      const res = entity.validatePath(path, evaluatedValue);
      if (res) {
        evaluatedValue = res.value;
        evaluationValidationErrors[entityId] = merge(
          {},
          evaluationValidationErrors[entityId],
          { [path]: res.errors },
        );
      }
      set(evalTree, item, evaluatedValue);
    }
    // remove leaves of the graph because they are only used for evaluation.
    toBeRemoved.forEach((item) => {
      set(evalTree, item, undefined);
    });

    // add setted props to the evalTree so they override their raw values in the main thread
    for (const [entityId, props] of entries(this.settedProps)) {
      for (const path of keys(props)) {
        const entity = this.editor.getEntityById(entityId);
        set(evalTree, `${entityId}.${path}`, get(entity.unevalValues, path));
      }
    }

    performance.mark('end-evaluatedForest');
    const duration = performance.measure(
      'evaluatedForest',
      'start-evaluatedForest',
      'end-evaluatedForest',
    );
    console.log('perf eval', duration.duration);
    this.lastEvaluatedForest = evalTree;
    return {
      evalTree,
      runtimeErrors,
      evaluationValidationErrors,
    };
  }
}