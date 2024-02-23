import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';

import { RuntimeEvaluable, WebloomDisposable } from './interfaces';
import { cloneDeep, debounce, get, set } from 'lodash';
import { WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import {
  EntityInspectorConfig,
  EntityTypes,
  EntityErrorsRecord,
} from '../interface';
import { getEvaluablePathsFromInspectorConfig } from '../evaluation';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '../validations';
import { Operation, applyPatch } from 'fast-json-patch';

export class Entity implements RuntimeEvaluable, WebloomDisposable {
  readonly entityType: EntityTypes;
  private readonly evaluablePaths: Set<string>;
  public readonly publicAPI: Set<string>;
  private dispoables: Array<() => void> = [];
  public readonly inspectorConfig: EntityInspectorConfig;
  public values: Record<string, unknown>;
  rawValues: Record<string, unknown>;
  public id: string;
  public finalValues: Record<string, unknown>;
  public validators: Record<string, ReturnType<typeof ajv.compile>>;
  public codePaths: Set<string>;
  protected readonly workerBroker: WorkerBroker;
  public errors: EntityErrorsRecord[string] = {};
  constructor({
    id,
    workerBroker,
    rawValues,
    inspectorConfig = [],
    evaluablePaths = [],
    publicAPI = new Set(),
    entityType: entityType,
  }: {
    id: string;
    entityType: EntityTypes;
    rawValues: Record<string, unknown>;
    inspectorConfig?: EntityInspectorConfig;
    evaluablePaths?: string[];
    publicAPI?: Set<string>;
    workerBroker: WorkerBroker;
  }) {
    makeObservable(this, {
      id: observable,
      rawValues: observable,
      values: observable,
      codePaths: observable,
      finalValues: observable,
      setValue: action,
      dispose: action,
      hasErrors: computed,
      applyEvalationUpdatePatch: action,
      applyErrorUpdatePatch: action,
      errors: observable,
    });
    this.publicAPI = publicAPI;
    this.id = id;
    this.entityType = entityType;
    this.workerBroker = workerBroker;
    this.rawValues = rawValues;
    this.finalValues = cloneDeep(rawValues);

    this.values = {};
    this.validators = extractValidators(inspectorConfig);
    for (const path in this.validators) {
      const res = this.validatePath(path, get(this.finalValues, path));
      if (res) {
        set(this.finalValues, path, res.value);
      }
    }
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(inspectorConfig),
    ]);
    this.codePaths = new Set<string>();
    this.inspectorConfig = inspectorConfig;
    this.dispoables.push(
      ...[
        reaction(() => this.rawValues, this.syncRawValuesWithEvaluationWorker),
      ],
    );
    this.workerBroker.postMessege({
      event: 'addEntity',
      body: {
        entityType: this.entityType,
        config: {
          unevalValues: toJS(this.rawValues),
          inspectorConfig: this.inspectorConfig,
          publicAPI: this.publicAPI,
          id: this.id,
        },
      },
    });
  }

  applyEvalationUpdatePatch(ops: Operation[]) {
    applyPatch(this.values, ops, false, true);
    applyPatch(this.finalValues, ops, false, true);
    // TODO: Can we move this to the worker?
    for (const path in this.validators) {
      const res = this.validatePath(
        path,
        get(this.values, path, get(this.rawValues, path)),
      );
      if (res) {
        this.addValidationErrors(path, res.errors);
        set(this.finalValues, path, res.value);
        set(this.values, path, res.value);
      } else {
        this.clearValidationErrorsForPath(path);
      }
    }
  }
  applyErrorUpdatePatch(ops: Operation[]) {
    // applyPatch(this.errors, ops, false, true);
  }

  clearValidationErrorsForPath(path: string) {
    if (!this.errors[path]) return;
    if (!this.errors[path].validationErrors) return;
    this.errors[path].validationErrors = [];
  }
  clearErrorsForPath(path: string) {
    this.errors[path] = {};
  }
  dispose() {
    this.dispoables.forEach((dispose) => dispose());
    this.workerBroker.postMessege({
      event: 'removeEntity',
      body: {
        id: this.id,
      },
    } as WorkerRequest);
  }

  syncRawValuesWithEvaluationWorker() {
    this.workerBroker.postMessege({
      event: 'updateEntity',
      body: {
        unevalValues: toJS(this.rawValues),
        id: this.id,
        entityType: this.entityType,
      },
    } as WorkerRequest);
  }

  debouncedSyncRawValuesWithEvaluationWorker = debounce(
    this.syncRawValuesWithEvaluationWorker,
    200,
  );
  setValue(path: string, value: unknown) {
    if (get(this.rawValues, path) === value) return;
    set(this.rawValues, path, value);
    if (get(this.values, path) === undefined) {
      const res = this.validatePath(path, value);
      if (res) {
        this.addValidationErrors(path, res.errors);
        value = res.value;
      }
      set(this.finalValues, path, value);
    }
    this.debouncedSyncRawValuesWithEvaluationWorker();
  }

  getValue(key: string) {
    return get(this.values, key, get(this.rawValues, key));
  }
  addValidationErrors(path: string, errors: string[]) {
    if (!this.errors[path]) {
      this.errors[path] = { validationErrors: [] };
    }
    this.errors[path].validationErrors = errors;
  }

  getRawValue(key: string) {
    return get(this.rawValues, key);
  }

  get hasErrors() {
    for (const key in this.errors) {
      if (this.errors[key]?.validationErrors?.length) return true;
      if (this.errors[key]?.evaluationErrors?.length) return true;
    }
    return false;
  }

  pathErrors(path: string) {
    return this.errors[path];
  }

  pathHasErrors(path: string) {
    if (!this.errors[path]) return false;
    const validationErrors = this.errors[path].validationErrors;
    const evaluationErrors = this.errors[path].evaluationErrors;
    if (validationErrors && validationErrors.length > 0) return true;
    if (evaluationErrors && evaluationErrors.length > 0) return true;
    return false;
  }

  validatePath(path: string, value: unknown) {
    const validate = this.validators[path];
    if (!validate) return null;
    validate(value);

    if (validate.errors) {
      // @ts-expect-error default is not defined in the type
      value = validate.schema.default;
      return {
        value,
        errors: validate.errors.map((error) => transformErrorToMessage(error)),
      };
    }
    return null;
  }
}
