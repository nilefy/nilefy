import { action, makeObservable, observable, reaction, toJS } from 'mobx';
import { EditorState } from './editor';
import {
  ActionExecutionPayload,
  AutocompleteRequest,
  FulfillActionRequest,
  InstallLibraryRequest,
  LintDiagnosticRequest,
  TSQuickInfoRequest,
  WorkerRequest,
  WorkerResponse,
} from './common/interface';
import { diff, Diff } from 'deep-diff';
import { klona } from 'klona';
import { omit } from 'lodash';
import { log } from 'loglevel';
import _ from 'lodash';

export type PromisedActionExecutionPayload = ActionExecutionPayload & {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};
export class MainThreadBroker {
  private disposables: (() => void)[] = [];
  private worker = self;
  private lastEntityToEntityDependencies: Record<
    string,
    {
      dependencies: string[];
      dependents: string[];
    }
  > = {};
  private lastEvaluatedForest: Record<string, unknown> = {};
  private lastRunTimeErros: Record<string, Record<string, string[]>> = {};
  private lastEvaluationValidationErrors: Record<
    string,
    Record<string, string[]>
  > = {};
  actionsQueue: PromisedActionExecutionPayload[] = [];
  pendingActionsQueue: PromisedActionExecutionPayload[] = [];
  constructor(private editorState: EditorState) {
    makeObservable(this, {
      receiveMessage: action.bound,
      actionsQueue: observable,
      pendingActionsQueue: observable,
      addAction: action,
      handleActionExecution: action,
      handleFulfillActionExecution: action,
    });
    const messageEventHandler = (e: MessageEvent) => {
      const { data } = e;
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
      reaction(
        () =>
          this.editorState.dependencyManager.dependencyGraph
            .entityToEntityDependencies,
        this.handleDependenciesUpdate,
      ),
      reaction(() => this.actionsQueue.length, this.handleActionExecution, {
        delay: 10,
      }),
    );
  }

  receiveMessage(req: WorkerRequest) {
    log('worker received', req);
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
            _.get(entity.unevalValues, body.eventName) as string,
          );
        } catch (error) {
          console.error('Error in eventExecution:', error);
        }
        break;
      case 'entityActionExecution':
        try {
          const entity = this.editorState.getEntityById(body.id);
          entity.actions[body.actionName]();
        } catch (error) {
          console.error('Error in actionExecution:', error);
        }
        break;
      case 'fulfillAction':
        this.handleFulfillActionExecution(body);
        break;
      case 'runJSQuery':
        this.editorState.evaluationManager.runJSQuery(body.queryId, body.id);
        break;
      case 'installLibrary':
        this.installLibrary(body);
        break;
      case 'updateLibraryName':
        this.editorState.updateLibraryName(body);
        break;
      case 'uninstallLibrary':
        this.editorState.uninstallLibrary(body);
        break;
      case 'autoComplete':
        this.handleAutoCompleteRequest(body);
        break;
      case 'lint':
        this.handleLintRequest(body);
        break;
      case 'updateTSFile':
        this.editorState.tsServer.then((ts) =>
          ts.setFile({
            fileName: body.fileName,
            content: body.content,
            isBinding: !!body.binding,
            isEvent: !!body.binding?.isEvent,
          }),
        );
        break;
      case 'quickInfo':
        this.handleQuickInfoRequest(body);
        break;
      case 'removeTsFile':
        this.editorState.tsServer.then((ts) => ts.deleteFile(body.fileName));
        break;
      default:
        break;
    }
  };

  handleQuickInfoRequest = (body: TSQuickInfoRequest['body']) => {
    this.editorState.tsServer.then((ts) => {
      const res = ts.quickInfo(body);
      this.postMessage(res);
    });
  };

  handleAutoCompleteRequest = (body: AutocompleteRequest['body']) => {
    this.editorState.tsServer.then((ts) => {
      const res = ts.handleAutoCompleteRequest(body);
      this.postMessage(res);
    });
  };
  handleLintRequest = (body: LintDiagnosticRequest['body']) => {
    this.editorState.tsServer.then((ts) => {
      const res = ts.handleLintRequest(body);
      this.postMessage(res);
    });
  };
  addAction(actionPayload: PromisedActionExecutionPayload) {
    this.actionsQueue.push(actionPayload);
  }
  async installLibrary(body: InstallLibraryRequest['body']) {
    const lib = await this.editorState.installLibrary(body);
    this.postMessage({
      event: 'fulfillLibraryInstall',
      body: {
        jsLibrary: lib,
      },
    });
  }
  postMessage(req: WorkerResponse) {
    log('sending from worker', req);
    this.worker.postMessage(req);
  }
  handleActionExecution = () => {
    const actions = toJS(this.actionsQueue).map((action) => {
      return omit(action, ['resolve', 'reject']);
    });
    this.pendingActionsQueue = [
      ...this.pendingActionsQueue,
      ...this.actionsQueue,
    ];
    this.actionsQueue = [];
    this.postMessage({
      event: 'ActionExecution',
      body: actions,
    });
  };

  handleFulfillActionExecution = (body: FulfillActionRequest['body']) => {
    // I don't think we have to fulfill in order since if the action is awaited there will be no other actions after it
    const action = this.pendingActionsQueue.find(
      (action) => action.id === body.id,
    );
    if (!action) return;
    if (body.error) {
      action.reject(body.error);
    } else {
      action.resolve(body.value);
    }
    this.pendingActionsQueue = this.pendingActionsQueue.filter(
      (action) => action.id !== body.id,
    );
  };
  handleDependenciesUpdate = () => {
    const serializedEntityToEntityDependencies = klona(
      this.editorState.dependencyManager.dependencyGraph
        .entityToEntityDependencies,
    );
    const lastEntityToEntityDependenciesWithDefault: Record<
      string,
      Record<string, string[]>
    > = {};
    for (const key in this.editorState.entities) {
      lastEntityToEntityDependenciesWithDefault[key] =
        this.lastEntityToEntityDependencies[key] || {};
    }
    const dependencyOps: Record<string, Diff<any>[]> = {};
    for (const key in lastEntityToEntityDependenciesWithDefault) {
      const lastDeps = lastEntityToEntityDependenciesWithDefault[key];
      const ops = diff(
        lastDeps,
        serializedEntityToEntityDependencies[key] || {},
      );
      if (!ops || ops.length === 0) continue;
      dependencyOps[key] = ops;
    }
    this.postMessage({
      event: 'DependencyUpdate',
      body: {
        dependencyUpdates: dependencyOps,
      },
    });
    this.lastEntityToEntityDependencies = serializedEntityToEntityDependencies;
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
