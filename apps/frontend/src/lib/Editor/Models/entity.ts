import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';

import { RuntimeEvaluable, WebloomDisposable } from './interfaces';
import { cloneDeep, debounce, entries, get, has, set } from 'lodash';
import { WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import {
  EntityInspectorConfig,
  EntityTypes,
  EntityErrorsRecord,
} from '../interface';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '../validations';
import { Operation, applyPatch } from 'fast-json-patch';
import {
  EntityActionRawConfig,
  EntityActionConfig as EntityActionsConfig,
} from '../evaluation/interface';
import { memoizeDebounce } from '../utils';
export class Entity implements RuntimeEvaluable, WebloomDisposable {
  readonly entityType: EntityTypes;
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
  public actions: Record<string, (...args: unknown[]) => void> = {};
  public actionsConfig: EntityActionsConfig;
  public rawActionsConfig: EntityActionRawConfig;
  constructor({
    id,
    workerBroker,
    rawValues,
    inspectorConfig = [],
    publicAPI = new Set(),
    entityType: entityType,
    entityActionConfig = {},
  }: {
    id: string;
    entityType: EntityTypes;
    rawValues: Record<string, unknown>;
    inspectorConfig?: EntityInspectorConfig;
    evaluablePaths?: string[];
    publicAPI?: Set<string>;
    workerBroker: WorkerBroker;
    entityActionConfig?: EntityActionsConfig;
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
      executeAction: action,
      errors: observable,
    });
    this.publicAPI = publicAPI;
    this.id = id;
    this.entityType = entityType;
    this.workerBroker = workerBroker;
    this.actionsConfig = cloneDeep(entityActionConfig);
    this.rawActionsConfig = Object.entries(entityActionConfig).reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        // @ts-expect-error fn is not defined in the type
        delete acc[key]['fn'];
        return acc;
      },
      {} as EntityActionRawConfig,
    );
    this.actions = this.processActionConfig(this.actionsConfig);
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

    this.codePaths = new Set<string>();
    this.inspectorConfig = inspectorConfig;

    this.workerBroker.postMessege({
      event: 'addEntity',
      body: {
        entityType: this.entityType,
        config: {
          unevalValues: toJS(this.rawValues),
          inspectorConfig: this.inspectorConfig,
          publicAPI: this.publicAPI,
          id: this.id,
          actionsConfig: this.rawActionsConfig,
        },
      },
    });
  }

  applyEvalationUpdatePatch(ops: Operation[]) {
    const changed = new Set<string>();
    const removed = new Set<string>();
    for (const op of ops) {
      if (op.op === '_get' || op.op === 'test') {
        continue;
      } else if (op.op === 'move') {
        changed.add(op.path);
        changed.add(op.from);
        removed.add(op.from);
      } else if (op.op === 'remove') {
        removed.add(op.path);
        changed.add(op.path);
      } else {
        changed.add(op.path);
      }
    }
    applyPatch(this.values, ops, false, true);
    applyPatch(this.finalValues, ops, false, true);
    for (const path of removed) {
      const lodashPath = path.split('/').slice(1);
      if (has(this.rawValues, lodashPath)) {
        set(this.finalValues, lodashPath, get(this.rawValues, lodashPath));
      }
    }
    // TODO: Can we move this to the worker
    for (const path in this.validators) {
      if (!changed.has(path.split('.').join('/'))) continue;
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

  syncRawValuesWithEvaluationWorker = (path: string) => {
    this.workerBroker.postMessege({
      event: 'updateEntity',
      body: {
        value: toJS(get(this.rawValues, path)),
        path,
        id: this.id,
        entityType: this.entityType,
      },
    } as WorkerRequest);
  };

  debouncedSyncRawValuesWithEvaluationWorker = memoizeDebounce(
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
    this.debouncedSyncRawValuesWithEvaluationWorker(path);
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

  processActionConfig = (config: EntityActionsConfig) => {
    const actions: Record<string, (...args: unknown[]) => void> = {};
    for (const key in config) {
      const configItem = config[key];
      if (configItem.type === 'SIDE_EFFECT') {
        actions[key] = (...args: unknown[]) => {
          runInAction(() => {
            configItem.fn(this, ...args);
          });
        };
      }
      // We needn't handle setters. They only work in the worker.
    }
    return actions;
  };

  executeAction = (actionName: string, ...args: unknown[]) => {
    const action = this.actions[actionName];
    if (!action) return;
    if (args.length === 0) {
      action();
      return;
    }
    action(...args);
  };
}
