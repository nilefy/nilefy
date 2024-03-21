import { action, makeObservable, observable, reaction, toJS } from 'mobx';
import { EditorState } from './editor';
import {
  EventExecutionResult,
  WorkerRequest,
  WorkerResponse,
} from './common/interface';
import { diff, Diff } from 'deep-diff';
import { klona } from 'klona';
export class MainThreadBroker {
  private disposables: (() => void)[] = [];
  private worker = self;
  private lastEvaluatedForest: Record<string, unknown> = {};
  private lastRunTimeErros: Record<string, Record<string, string[]>> = {};
  private lastEvaluationValidationErrors: Record<
    string,
    Record<string, string[]>
  > = {};
  actionsQueue: EventExecutionResult[] = [];
  constructor(private editorState: EditorState) {
    makeObservable(this, {
      receiveMessage: action.bound,
      actionsQueue: observable,
    });
    const messageEventHandler = (e: MessageEvent) => {
      const { data } = e;
      const { event, body } = data as WorkerRequest;
      console.log('worker received', event, body);
      this.receiveMessage(data);
    };
    const errorHandler = (e: ErrorEvent) => {
      console.error('Error in worker', e);
    };
    const errorMessageHandler = (e: MessageEvent) => {
      console.error('Meesege Error in worker', e);
    };
    this.worker.addEventListener('message', messageEventHandler);
    this.worker.addEventListener('error', errorHandler);
    this.worker.addEventListener('messageerror', errorMessageHandler);
    this.disposables.push(
      () => this.worker.removeEventListener('message', messageEventHandler),
      () => this.worker.removeEventListener('error', errorHandler),
      () =>
        this.worker.removeEventListener('messageerror', errorMessageHandler),
      reaction(
        () => this.editorState.evaluationManager.evaluatedForest,
        this.handleEvaluationUpdate,
      ),
      reaction(() => this.actionsQueue.length, this.handleEventExecution, {
        delay: 10,
      }),
    );
  }

  receiveMessage(req: WorkerRequest) {
    if (req.event === 'batch') {
      req.body.forEach(this.eventSwitch);
    } else {
      this.eventSwitch(req);
    }
  }
  eventSwitch = (req: WorkerRequest) => {
    const { event, body } = req as WorkerRequest;
    switch (event) {
      case 'init':
        try {
          this.editorState.init(body);
        } catch (error) {
          console.error('Error in init:', error);
        }
        break;
      case 'updateEntity':
        try {
          this.editorState
            .getEntityById(body.id)
            .setValue(body.path, body.value);
        } catch (error) {
          console.error('Error in updateEntity:', error);
        }
        break;
      case 'removeEntity':
        try {
          this.editorState.removeEntity(body.id);
        } catch (error) {
          console.error('Error in removeEntity:', error);
        }
        break;
      case 'addEntity':
        try {
          this.editorState.addEntity(body);
        } catch (error) {
          console.error('Error in addEntity:', error);
        }
        break;
      case 'changePage':
        try {
          this.editorState.changePage(body.currentPageId);
        } catch (error) {
          console.error('Error in changePage:', error);
        }
        break;
      case 'eventExecution':
        try {
          const entity = this.editorState.getEntityById(body.id);
          if (!entity) return;
          this.editorState.evaluationManager.executeEvent(
            entity.id,
            entity.unevalValues[body.eventName] as string,
          );
        } catch (error) {
          console.error('Error in eventExecution:', error);
        }
        break;
    }
  };
  addEvent(eventResult: EventExecutionResult) {
    console.log('eventResult', eventResult);
    this.actionsQueue.push(eventResult);
  }
  postMessage(req: WorkerResponse) {
    this.worker.postMessage(req);
  }
  handleEventExecution = () => {
    const actions = toJS(this.actionsQueue);
    this.actionsQueue = [];
    this.postMessage({
      event: 'EventExecution',
      body: actions,
    });
  };

  handleEvaluationUpdate = () => {
    const serializedEvalForest = klona(
      this.editorState.evaluationManager.evaluatedForest.evalTree,
    );
    const serializedRuntimeErrors = klona(
      this.editorState.evaluationManager.evaluatedForest.runtimeErrors,
    );
    const serializedValidationErrors = klona(
      this.editorState.evaluationManager.evaluatedForest
        .evaluationValidationErrors,
    );
    const lastEvalTreeWithDefault: Record<string, unknown> = {};
    const lastRunTimeErrorsWithDefault: Record<
      string,
      Record<string, string[]>
    > = {};
    const lastValidationErrorsWithDefault: Record<
      string,
      Record<string, string[]>
    > = {};
    for (const key in this.editorState.entities) {
      lastEvalTreeWithDefault[key] = this.lastEvaluatedForest[key] || {};
      lastRunTimeErrorsWithDefault[key] = this.lastRunTimeErros[key] || {};
      lastValidationErrorsWithDefault[key] =
        this.lastEvaluationValidationErrors[key] || {};
    }
    const evaluationOps: Record<string, Diff<any>[]> = {};
    const runtimeErrorOps: Record<string, Diff<any>[]> = {};
    const validationErrorOps: Record<string, Diff<any>[]> = {};
    for (const key in lastEvalTreeWithDefault) {
      const lastEval = lastEvalTreeWithDefault[key];

      const ops = diff(lastEval, serializedEvalForest[key] || {});
      if (!ops || ops.length === 0) continue;
      evaluationOps[key] = ops;
    }
    for (const key in lastRunTimeErrorsWithDefault) {
      const lastErr = lastRunTimeErrorsWithDefault[key];
      const ops = diff(lastErr, serializedRuntimeErrors[key] || {});
      if (!ops || ops.length === 0) continue;
      runtimeErrorOps[key] = ops;
    }
    for (const key in lastValidationErrorsWithDefault) {
      const lastErr = lastValidationErrorsWithDefault[key];
      const ops = diff(lastErr, serializedValidationErrors[key] || {});
      if (!ops || ops.length === 0) continue;
      validationErrorOps[key] = ops;
    }

    this.postMessage({
      event: 'EvaluationUpdate',
      body: {
        evaluationUpdates: evaluationOps,
        runtimeErrorUpdates: runtimeErrorOps,
        validationErrorUpdates: validationErrorOps,
      },
    });
    this.lastEvaluatedForest = serializedEvalForest;
    this.lastRunTimeErros = serializedRuntimeErrors;
    this.lastEvaluationValidationErrors = serializedValidationErrors;
  };
  dispose() {
    this.disposables.forEach((fn) => fn());
  }
}
