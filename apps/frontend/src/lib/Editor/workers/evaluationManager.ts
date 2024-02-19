import { computed, makeObservable, observable } from 'mobx';
import invariant from 'invariant';
import { get, merge, set } from 'lodash';
import { evaluate } from '../evaluation';
import { EditorState } from './editor';
import { bindingRegexGlobal } from '@/lib/utils';
import { EntityErrors } from '../interface';

export class EvaluationManager {
  editor: EditorState;
  disposables: Array<() => void> = [];
  constructor(editor: EditorState) {
    makeObservable(this, {
      editor: observable,
      evaluatedForest: computed({
        keepAlive: true,
        requiresReaction: false,
      }),
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
  get evaluatedForest() {
    performance.mark('start-evaluatedForest');
    const sortedGraph = this.editor.dependencyManager.graph;
    const evalTree: Record<string, unknown> = {};
    const errors: Record<string, EntityErrors> = {};

    const alreadyEvaluated = new Set<string>();
    for (const item of this.editor.dependencyManager.leaves) {
      const [entityId, ...pathArr] = item.split('.');
      const path = pathArr.join('.');
      alreadyEvaluated.add(path);
      const entity = this.editor.getEntityById(entityId);
      const unevalValue = get(entity.unevalValues, path);
      if (EvaluationManager.isCode(unevalValue)) {
        let evaluatedValue = evaluate(unevalValue, evalTree);
        const res = entity.validatePath(path, evaluatedValue);
        if (res) {
          const { value, errors: validationErrors } = res;
          evaluatedValue = value;
          merge(errors, { [item]: { validationErrors } });
        }
        set(evalTree, item, evaluatedValue);
        continue;
      }
      set(evalTree, item, unevalValue);
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
      let evaluatedValue = evaluate(unevalValue as string, evalTree);
      const res = entity.validatePath(path, evaluatedValue);
      if (res) {
        const { value, errors: validationErrors } = res;
        evaluatedValue = value;
        merge(errors, { [item]: { validationErrors } });
      }
      set(evalTree, item, evaluatedValue);
    }
    performance.mark('end-evaluatedForest');
    const duration = performance.measure(
      'evaluatedForest',
      'start-evaluatedForest',
      'end-evaluatedForest',
    );
    console.log('evaluatedForest', duration.duration);
    return {
      evalTree,
      errors,
    };
  }
}
