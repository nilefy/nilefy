import { JSLibraryI } from '@/api/JSLibraries.api';
import { EntityTypes } from '../../interface';
import { JSLibrary } from '../../libraries';
import { EntityConfig } from '../editor';
import { Diff } from 'deep-diff';
import ts from 'typescript';
import { Diagnostic } from '@codemirror/lint';

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
  | AutocompleteResponse
  | LintDiagnosticResponse
  | TSQuickInfoResponse
  | DependencyUpdateResponse;
export type EntityConfigBody = Omit<
  EntityConfig,
  'dependencyManager' | 'mainThreadBroker' | 'editorState'
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
  | UpdateLibraryNameRequest
  | AutocompleteRequest
  | UpdateTSFileRequest
  | LintDiagnosticRequest
  | TSQuickInfoRequest
  | RemoveTSFileRequest
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
    libraries: JSLibraryI[];
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
    defaultName?: string;
    name?: string;
  };
};

export type UpdateLibraryNameRequest = {
  event: 'updateLibraryName';
  body: {
    newName: string;
    id: string;
  };
};

export type UninstallLibraryRequest = {
  event: 'uninstallLibrary';
  body: {
    id: string;
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

export type AutocompleteRequest = {
  event: 'autoComplete';
  body: {
    fileName: string;
    // we send the fileContent despite the fact that the worker already has it, is because the updates are throttled
    // and we need to make sure that the worker has the latest content
    fileContent: string;
    position: number;
    requestId: string;
  };
};

export type AutocompleteResponse = {
  event: 'fulfillAutoComplete';
  body: {
    requestId: string;
    completions: ts.WithMetadata<ts.CompletionInfo> | undefined;
  };
};

export type LintDiagnosticRequest = {
  event: 'lint';
  body: {
    fileName: string;
    requestId: string;
  };
};

export type LintDiagnosticResponse = {
  event: 'fulfillLint';
  body: {
    requestId: string;
    diagnostics: Diagnostic[];
  };
};

export type UpdateTSFileRequest = {
  event: 'updateTSFile';
  body: {
    fileName: string;
    content: string;
  };
};

export type TSQuickInfoRequest = {
  event: 'quickInfo';
  body: {
    fileName: string;
    position: number;
    requestId: string;
  };
};

export type TSQuickInfoResponse = {
  event: 'fulfillQuickInfo';
  body: {
    requestId: string;
    info: ts.QuickInfo | undefined;
  };
};

export type RemoveTSFileRequest = {
  event: 'removeTsFile';
  body: {
    fileName: string;
  };
};
