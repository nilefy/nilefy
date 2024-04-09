import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import {
  FulfillJSQueryResponse,
  WorkerActionExecutionResponse,
  WorkerRequest,
  WorkerResponse,
} from '../workers/common/interface';
import { debounce } from 'lodash';
import { WebloomDisposable } from './interface';
import { EditorState } from './editor';
// @ts-expect-error no types
import structuredClone from '@ungap/structured-clone';
import { nanoid } from 'nanoid';

export class WorkerBroker implements WebloomDisposable {
  public readonly worker: Worker;
  private queue: WorkerRequest[];
  private disposables: (() => void)[] = [];
  pendingJSQueryExecution: Array<{
    id: string;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];
  constructor(private readonly editorState: EditorState) {
    this.editorState = editorState;
    this.worker = new Worker(
      new URL('../workers/evaluation.worker.ts', import.meta.url),
      { type: 'module' },
    );

    makeObservable(this, {
      // @ts-expect-error mobx decorators please
      queue: observable,
      debouncePostMessege: action.bound,
      receiveMessage: action,
      postMessege: action,
      _postMessege: action,
      handleActionExecution: action,
      jsQueryExecutionRequest: action,
      pendingJSQueryExecution: observable,
      fulfillJSQuery: action,
    });

    this.queue = [];

    const handler = (e: MessageEvent) => {
      this.receiveMessage(e.data);
    };
    this.worker.addEventListener('message', handler);
    this.disposables.push(
      ...[
        () => this.worker.terminate(),
        reaction(() => this.queue.length, this.debouncePostMessege),
        () => this.worker.removeEventListener('message', handler),
      ],
    );
  }
  postMessege(req: WorkerRequest) {
    this.queue.push(req);
  }
  async jsQueryExecutionRequest(queryId: string) {
    const promise = new Promise((resolve, reject) => {
      const id = nanoid();
      this.pendingJSQueryExecution.push({
        resolve,
        reject,
        id,
      });
      this.queue.push({
        event: 'runJSQuery',
        body: { queryId: queryId, id },
      });
    });
    return (await promise) as Promise<{ data: unknown; error: string }>;
  }
  _postMessege() {
    if (!this.queue.length) return;
    // We're using a custom structured clone because this one ignores unsupported types
    const queueCopy = structuredClone(toJS(this.queue), {
      lossy: true,
      json: true,
    });
    runInAction(() => {
      this.queue = [];
    });
    this.worker.postMessage({
      event: 'batch',
      body: queueCopy,
    });
  }

  receiveMessage(res: WorkerResponse) {
    const { event, body } = res;
    console.log('worker sent', event, body);
    switch (event) {
      case 'EvaluationUpdate':
        this.editorState.applyEvalForestPatch(
          body.evaluationUpdates,
          body.runtimeErrorUpdates,
          body.validationErrorUpdates,
        );
        break;
      case 'DependencyUpdate':
        this.editorState.applyEntityToEntityDependencyPatch(
          body.dependencyUpdates,
        );
        break;
      case 'ActionExecution':
        this.handleActionExecution(body);
        break;
      case 'fulfillJSQuery':
        this.fulfillJSQuery(body);
        break;
      default:
        break;
    }
  }

  fulfillJSQuery = (body: FulfillJSQueryResponse['body']) => {
    const { id, value, error } = body;
    const jsQuery = this.pendingJSQueryExecution.find((item) => item.id === id);
    if (!jsQuery) return;
    if (error) {
      jsQuery.reject(error);
    } else {
      jsQuery.resolve(value);
    }
    this.pendingJSQueryExecution = this.pendingJSQueryExecution.filter(
      (item) => item.id !== id,
    );
  };

  handleActionExecution = async (
    body: WorkerActionExecutionResponse['body'],
  ) => {
    const action = async (
      executionResult: WorkerActionExecutionResponse['body'][number],
    ) => {
      const id = executionResult.entityId;
      const entity = this.editorState.getEntityById(id);
      if (!entity) return;
      // Todo: create a promise that resolves when no widgets has debounced updates => this will allow us to wait for the updates to be applied before executing the action
      //flush queue first so that the worker has the latest state
      this._postMessege();
      await entity.executeAction(
        executionResult.id,
        executionResult.actionName,
        ...executionResult.args,
      );
    };
    // execute promises sequentially
    for (const executionResult of body) {
      await action(executionResult);
    }
  };
  private debouncePostMessege = debounce(this._postMessege, 100);

  dispose() {
    this.disposables.forEach((fn) => fn());
  }
}
