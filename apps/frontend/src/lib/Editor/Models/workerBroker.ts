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
  FulFillLibraryInstallResponse,
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
import { JSLibrary } from '../libraries';
import { getNewEntityName } from '../entitiesNameSeed';
import log from 'loglevel';
import { TSServerBroker } from './tsServerBroker';

export type PendingRequest<TValue = unknown, TError = unknown> = {
  resolve: (value: TValue) => void;
  reject: (reason: TError) => void;
  id: string;
};
export class WorkerBroker implements WebloomDisposable {
  public readonly worker: Worker;
  private queue: WorkerRequest[];
  tsServer: TSServerBroker = new TSServerBroker(this);
  private disposables: (() => void)[] = [];
  pendingJSQueryExecution: Array<PendingRequest> = [];
  // Can only be one pending install library request at a time
  pendingInstallLibraryRequest: {
    resolve: (value: JSLibrary) => void;
    reject: (reason: unknown) => void;
  } | null = null;

  constructor(private readonly editorState: EditorState) {
    this.editorState = editorState;
    this.worker = new Worker(
      new URL('../workers/evaluation.worker.ts', import.meta.url),
      { type: 'module' },
    );
    this.worker.postMessage({
      event: 'ping',
      body: {},
    });
    makeObservable(this, {
      // @ts-expect-error mobx decorators please
      queue: observable,
      debouncePostMessege: action.bound,
      receiveMessage: action,
      postMessegeInBatch: action,
      _postMessege: action,
      handleActionExecution: action,
      jsQueryExecutionRequest: action,
      pendingJSQueryExecution: observable,
      fulfillJSQuery: action,
      pendingInstallLibraryRequest: observable,
      installLibrary: action,
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
  postMessegeInBatch(req: WorkerRequest) {
    this.queue.push(req);
  }
  postMessege(req: WorkerRequest) {
    this.worker.postMessage(req);
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
    log.info('posting message to worker', queueCopy);
    this.worker.postMessage({
      event: 'batch',
      body: queueCopy,
    });
  }

  receiveMessage(res: WorkerResponse) {
    const { event, body } = res;
    log.info('worker sent', event, body);
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
      case 'fulfillLibraryInstall':
        this.fulfillInstallLibrary(body);
        break;
      case 'fulfillAutoComplete':
        this.tsServer.fulfillAutoComplete(body);
        break;
      case 'fulfillLint':
        this.tsServer.fulfillLint(body);
        break;
      case 'fulfillQuickInfo':
        this.tsServer.fulfillQuickInfo(body);
        break;
      default:
        break;
    }
  }

  installLibrary = (url: string) => {
    if (this.pendingInstallLibraryRequest) {
      throw new Error('There is already a pending install library request');
    }
    const promise = new Promise<JSLibrary>((resolve, reject) => {
      this.pendingInstallLibraryRequest = {
        resolve,
        reject,
      };
    });
    this.queue.push({
      event: 'installLibrary',
      body: { url, defaultName: getNewEntityName('jsLibrary', false) },
    });
    setTimeout(() => {
      if (this.pendingInstallLibraryRequest) {
        this.pendingInstallLibraryRequest.reject(
          new Error('Library install request timed out'),
        );
        this.pendingInstallLibraryRequest = null;
      }
    }, 5000);
    return promise;
  };

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
  fulfillInstallLibrary = (body: FulFillLibraryInstallResponse['body']) => {
    if (!this.pendingInstallLibraryRequest) return;
    if (body.error) {
      this.pendingInstallLibraryRequest.reject(body.error);
      this.pendingInstallLibraryRequest = null;
      return;
    }
    this.pendingInstallLibraryRequest.resolve(body.jsLibrary!);
    this.pendingInstallLibraryRequest = null;
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
