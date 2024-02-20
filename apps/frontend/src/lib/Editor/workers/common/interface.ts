import { EntityTypes } from '../../interface';
import { EntityConfig } from '../editor';
import { Operation } from 'fast-json-patch';
export type WorkerResponse = EvaluationUpdateResponse;
export type EntityConfigBody = Omit<EntityConfig, 'dependencyManager'>;
export type WorkerRequest =
  | InitRequest
  | UpdateEntityRequest
  | RemoveEntityRequest
  | AddEntityRequest
  | ChangePageRequest
  | BatchRequest;
export type EvaluationUpdateResponse = {
  body: {
    evaluationUpdates: Record<string, Operation[]>;
    errorUpdates: Record<string, Operation[]>;
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
  };
  event: 'init';
};

export type UpdateEntityRequest = {
  event: 'updateEntity';
  body: {
    id: string;
    unevalValues: EntityConfigBody['unevalValues'];
  };
};

export type RemoveEntityRequest = {
  event: 'removeEntity';
  body: {
    id: string;
  };
};

export type BatchRequest = {
  event: 'batch';
  body: WorkerRequest[];
};
