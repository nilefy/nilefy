import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  toJS,
} from 'mobx';
import toposort from 'toposort';
import invariant from 'invariant';
import _ from 'lodash';
import { evaluate } from '../evaluation';
import { EditorState } from './editor';

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
    autorun(() => console.log('evalman forest', toJS(this.evaluatedForest)));
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
    console.log('sorted', sortedGraph);
    for (const node of sortedGraph) {
      evaluatedInGraph.add(node);
      const [entityId, ...rest] = node.split('.');
      const path = rest.join('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      // get leaf nodes values
      if (
        !this.editor.dependencyManager.getDirectDependencies(entityId) &&
        !this.isRawValueCode(entityId, path)
      ) {
        _.set(evalTree, node, _.get(toJS(entity.publicProps), path));
        continue;
      }
      console.log('path', path);
      let obj;
      if (this.isRawValueCode(entity.id, path)) obj = entity.propsToBeEvaluated;
      else obj = entity.publicProps;
      _.set(
        evalTree,
        node,
        evaluate(_.get(toJS(obj), path) as string, evalTree),
      );
    }
    for (const node of this.codeRawValues) {
      if (evaluatedInGraph.has(node)) continue;
      const [entityId, ...rest] = node.split('.');
      const path = rest.join('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      console.log('path2', path);
      _.set(
        evalTree,
        node,
        evaluate(
          _.get(toJS(entity.propsToBeEvaluated), path) as string,
          evalTree,
        ),
      );
    }
    return evalTree;
  }
}
