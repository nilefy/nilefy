import { EntityTypes } from '../../interface';
import { JSLibrary } from '../../libraries';
import { EntityConfig } from '../editor';
import { Diff } from 'deep-diff';

export type ActionExecutionPayload = {
  entityId: string;
  id: string;
  actionName: string;
  args: unknown[];
};

export type WorkerActionExecutionResponse = {
  body: ActionExecutionPayload[];
  event: 'ActionExecution';
};

export type FulfillJSQueryResponse = {
  event: 'fulfillJSQuery';
  body: {
    id: string;
    value?: unknown;
    error?: unknown;
  };
};

export type DependencyUpdateResponse = {
  body: {
    dependencyUpdates: Record<string, Diff<any>[]>;
  };
  event: 'DependencyUpdate';
};

export type WorkerResponse =
  | EvaluationUpdateResponse
  | WorkerActionExecutionResponse
  | FulfillJSQueryResponse
  | FulFillLibraryInstallResponse
  | DependencyUpdateResponse;
export type EntityConfigBody = Omit<
  EntityConfig,
  'dependencyManager' | 'mainThreadBroker'
>;
export type WorkerRequest =
  | InitRequest
  | UpdateEntityRequest
  | RemoveEntityRequest
  | AddEntityRequest
  | ChangePageRequest
  | EntityEventExecutionRequest
  | EntityActionExecutionRequest
  | FulfillActionRequest
  | RunJSQueryRequest
  | InstallLibraryRequest
  | UninstallLibraryRequest
  | BatchRequest;
export type EvaluationUpdateResponse = {
  body: {
    evaluationUpdates: Record<string, Diff<any>[]>;
    runtimeErrorUpdates: Record<string, Diff<any>[]>;
    validationErrorUpdates: Record<string, Diff<any>[]>;
  };
  event: 'EvaluationUpdate';
};
export type AddEntityRequest = {
  event: 'addEntity';
  body: {
    entityType: EntityTypes;
    config: EntityConfigBody;
  };
};
export type ChangePageRequest = {
  event: 'changePage';
  body: {
    currentPageId: string;
  };
};
export type InitRequest = {
  body: {
    currentPageId: string;
    queries: Record<string, EntityConfigBody>;
    pages: Record<string, Record<string, EntityConfigBody>>;
    globals: EntityConfigBody;
  };
  event: 'init';
};

export type UpdateEntityRequest = {
  event: 'updateEntity';
  body: {
    id: string;
    path: string;
    value: unknown;
  };
};

export type EntityEventExecutionRequest = {
  event: 'eventExecution';
  body: {
    id: string;
    eventName: string;
  };
};
export type FulfillActionRequest = {
  event: 'fulfillAction';
  body: {
    id: string;
    value?: unknown;
    error?: unknown;
  };
};
export type RemoveEntityRequest = {
  event: 'removeEntity';
  body: {
    id: string;
  };
};
export type EntityActionExecutionRequest = {
  event: 'entityActionExecution';
  body: {
    id: string;
    actionName: string;
  };
};

export type RunJSQueryRequest = {
  event: 'runJSQuery';
  body: {
    id: string;
    queryId: string;
  };
};

export type InstallLibraryRequest = {
  event: 'installLibrary';
  body: {
    url: string;
    defaultName: string;
  };
};

export type UpdateLibraryNameRequest = {
  event: 'updateLibraryName';
  body: {
    url: string;
    name: string;
  };
};

export type UninstallLibraryRequest = {
  event: 'uninstallLibrary';
  body: {
    url: string;
  };
};

export type FulFillLibraryInstallResponse = {
  event: 'fulfillLibraryInstall';
  body: {
    jsLibrary?: JSLibrary;
    error?: unknown;
  };
};
export type BatchRequest = {
  event: 'batch';
  body: WorkerRequest[];
};
