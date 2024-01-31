import { action, computed, makeObservable, observable } from 'mobx';
import toposort from 'toposort';
import invariant from 'invariant';
import { get, set } from 'lodash';
import { evaluate } from '../evaluation';
import { EditorState } from './editor';
import { WebloomWidget } from './widget';
import { WebloomQuery } from './query';

export class EvaluationManager {
  editor: EditorState;
  codeRawValues: Set<string>;

  constructor(editor: EditorState) {
    makeObservable(this, {
      editor: observable,
      codeRawValues: observable,
      evaluatedForest: computed({
        keepAlive: true,
        requiresReaction: false,
      }),
      setRawValueIsCode: action,
    });
    this.codeRawValues = new Set();
    this.editor = editor;
  }

  /**
   * Some entities doesn't have any dependencies, but they are still code and should be evaluated
   */
  setRawValueIsCode(entityId: string, path: string, isCode = false) {
    if (isCode) {
      this.codeRawValues.add(`${entityId}.${path}`);
    } else {
      this.codeRawValues.delete(`${entityId}.${path}`);
    }
  }

  isRawValueCode(entityId: string, path: string) {
    return this.codeRawValues.has(`${entityId}.${path}`);
  }

  get evaluatedForest(): Record<string, unknown> {
    // todo: Check if a certain tree in the forest didn't exhibit any change, then don't re-evaluate it
    const sortedGraph = toposort(this.editor.dependencyManager.graph).reverse();
    const evalTree: Record<string, unknown> = {};
    const evaluatedInGraph = new Set<string>();
    for (const node of sortedGraph) {
      evaluatedInGraph.add(node);
      const [entityId, path] = node.split('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      if (
        !this.editor.dependencyManager.getDirectDependencies(entityId) &&
        !this.isRawValueCode(entityId, path)
      ) {
        // get the public data from rawValues
        if (entity instanceof WebloomWidget || entity instanceof WebloomQuery) {
          set(evalTree, node, get(entity.rawValues, path));
        }
        continue;
      }
      let obj: unknown;
      if (entity instanceof WebloomQuery) obj = entity.unEvaluatedConfig;
      else if (entity instanceof WebloomWidget) obj = entity.rawValues;
      else throw new Error("i don't know this type");
      set(evalTree, node, evaluate(get(obj, path) as string, evalTree));
    }
    for (const node of this.codeRawValues) {
      if (evaluatedInGraph.has(node)) continue;
      const [entityId, path] = node.split('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      let obj: unknown;
      if (entity instanceof WebloomQuery) obj = entity.unEvaluatedConfig;
      else if (entity instanceof WebloomWidget) obj = entity.rawValues;
      else throw new Error("i don't know this type");
      set(evalTree, node, evaluate(get(obj, path) as string, evalTree));
    }
    return evalTree;
  }
}
