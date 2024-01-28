import { action, computed, makeObservable, observable } from 'mobx';
import { WebloomPage } from './page';
import toposort from 'toposort';
import invariant from 'invariant';
import { get, set } from 'lodash';
import { evaluate } from '../evaluation';

export class EvaluationManager {
  page: WebloomPage;
  codeRawValues: Set<string>;
  constructor(page: WebloomPage) {
    makeObservable(this, {
      page: observable,
      codeRawValues: observable,
      evaluatedForest: computed({
        keepAlive: true,
        requiresReaction: false,
      }),
      setRawValueIsCode: action,
    });
    this.codeRawValues = new Set();
    this.page = page;
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
    const sortedGraph = toposort(this.page.dependencyManager.graph).reverse();
    const evalTree: Record<string, unknown> = {};
    const evaluatedInGraph = new Set<string>();
    for (const node of sortedGraph) {
      evaluatedInGraph.add(node);
      const [entityId, path] = node.split('.');
      const entity = this.page.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      if (
        !this.page.dependencyManager.getDirectDependencies(entityId) &&
        !this.isRawValueCode(entityId, path)
      ) {
        set(evalTree, node, get(entity.rawValues, path));
        continue;
      }
      set(evalTree, node, evaluate(get(entity.rawValues, path), evalTree));
    }
    for (const node of this.codeRawValues) {
      if (evaluatedInGraph.has(node)) continue;
      const [entityId, path] = node.split('.');
      const entity = this.page.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      set(evalTree, node, evaluate(get(entity.rawValues, path), evalTree));
    }
    return evalTree;
  }
}
