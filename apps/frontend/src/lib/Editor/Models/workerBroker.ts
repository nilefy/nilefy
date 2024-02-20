import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { WorkerRequest, WorkerResponse } from '../workers/common/interface';
import { debounce } from 'lodash';
import { Operation } from 'fast-json-patch';
import { WebloomDisposable } from './interfaces';

export class WorkerBroker implements WebloomDisposable {
  public readonly worker: Worker;
  private queue: WorkerRequest[];
  private disposables: (() => void)[] = [];
  public lastEvalUpdates: Record<string, Operation[]> = {};
  public lastErrorUpdates: Record<string, Operation[]> = {};
  constructor() {
    this.worker = new Worker(
      new URL('../workers/evaluation.worker.ts', import.meta.url),
      { type: 'module' },
    );

    makeObservable(this, {
      // @ts-expect-error mobx decorators please
      queue: observable,
      lastEvalUpdates: observable.ref,
      lastErrorUpdates: observable.ref,
      debouncePostMessege: action.bound,
      receiveMessage: action,
      postMessege: action,
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

  _postMessege() {
    if (!this.queue.length) return;
    const queueCopy = toJS(this.queue);
    runInAction(() => {
      this.queue = [];
    });
    this.worker.postMessage({
      event: 'batch',
      body: queueCopy,
    } as WorkerRequest);
  }

  receiveMessage(res: WorkerResponse) {
    const { event, body } = res;
    console.log('worker sent', event, body);
    switch (event) {
      case 'EvaluationUpdate':
        this.lastEvalUpdates = body.evaluationUpdates;
        this.lastErrorUpdates = body.errorUpdates;
        break;
      default:
        break;
    }
  }

  private debouncePostMessege = debounce(this._postMessege, 500);

  dispose() {
    this.disposables.forEach((fn) => fn());
  }
}
