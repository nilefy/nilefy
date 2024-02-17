import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';
import toposort from 'toposort';
import invariant from 'invariant';
import { debounce, get, set } from 'lodash';
import { evaluate } from '../evaluation';
import { EditorState } from './editor';
const worker = new Worker(
  new URL('../workers/evaluation.worker.ts', import.meta.url),
  { type: 'module' },
);
export class EvaluationManager {
  editor: EditorState;
  codeRawValues: Set<string>;
  evaluationWorker: Worker;
  disposables: Array<() => void> = [];
  constructor(editor: EditorState) {
    makeObservable(this, {
      editor: observable,
      codeRawValues: observable,
      evaluatedForest: computed({
        keepAlive: true,
        requiresReaction: false,
      }),
      setRawValueIsCode: action,
      evaluationWorkerPayload: computed,
      callWorker: action.bound,
      debouncedCallWorker: action.bound,
    });
    this.codeRawValues = new Set();
    this.editor = editor;
    this.evaluationWorker = worker;
    this.disposables.push(
      () => this.evaluationWorker.terminate(),
      reaction(() => this.evaluationWorkerPayload, this.debouncedCallWorker),
    );
    this.evaluationWorker.onmessage = (event) => {
      // console.log('event', event);
    };
    this.evaluationWorker.addEventListener('message', (e) => {
      // console.log('data from worker', e);
    });
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
  callWorker() {
    if (!this.evaluationWorker) return;
    this.evaluationWorker.postMessage(this.evaluationWorkerPayload);
  }
  debouncedCallWorker = debounce(this.callWorker, 500);
  isRawValueCode(entityId: string, path: string) {
    return this.codeRawValues.has(`${entityId}.${path}`);
  }
  get evaluationWorkerPayload() {
    return {
      code: 'update',
      body: {
        dependencies: toJS(this.editor.dependencyManager.dependencies),
        unevalNodes: Object.entries(this.editor.entities).reduce(
          (prev, cur) => {
            prev[cur[0]] = toJS(cur[1].rawValues);
            return prev;
          },
          {},
        ),
        codeRawValues: toJS(this.codeRawValues),
      },
    };
  }
  get evaluatedForest(): Record<string, unknown> {
    // todo: Check if a certain tree in the forest didn't exhibit any change, then don't re-evaluate it
    const sortedGraph = toposort(this.editor.dependencyManager.graph).reverse();
    const evalTree: Record<string, unknown> = {};
    const evaluatedInGraph = new Set<string>();
    for (const node of sortedGraph) {
      evaluatedInGraph.add(node);
      const [entityId, ...pathArr] = node.split('.');
      const path = pathArr.join('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      if (
        !this.editor.dependencyManager.getDirectDependencies(entityId) &&
        !this.isRawValueCode(entityId, path)
      ) {
        set(evalTree, node, toJS(get(entity.rawValues, path)));
        continue;
      }
      const gottenValue = get(entity.rawValues, path);
      invariant(
        typeof gottenValue === 'string' || gottenValue === undefined,
        `gottenValue should be string but got ${JSON.stringify(gottenValue)}`,
      );
      set(evalTree, node, evaluate(gottenValue || '', evalTree));
    }
    // will hit this loop with code without deps
    // example: {{[{name: "dsa"}]}}
    for (const node of this.codeRawValues) {
      if (evaluatedInGraph.has(node)) continue;
      const [entityId, ...pathArr] = node.split('.');
      const path = pathArr.join('.');
      const entity = this.editor.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      const gottenValue = get(entity.rawValues, path);
      invariant(
        typeof gottenValue === 'string' || gottenValue === undefined,
        `gottenValue should be string but got ${JSON.stringify(gottenValue)}`,
      );
      set(evalTree, node, evaluate(gottenValue || '', evalTree));
    }
    return evalTree;
  }
}
