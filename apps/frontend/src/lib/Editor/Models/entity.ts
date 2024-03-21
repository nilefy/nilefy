import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx';

import { RuntimeEvaluable, WebloomDisposable } from './interfaces';
import { get, isArray, set } from 'lodash';
import { klona } from 'klona';
import { WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';
import { EntityInspectorConfig, EntityTypes } from '../interface';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '../validations';
import { Diff, applyChange, diff } from 'deep-diff';
import {
  EntityActionRawConfig,
  EntityActionConfig,
} from '../evaluation/interface';
import { memoizeDebounce } from '../utils';
import { getEvaluablePathsFromInspectorConfig } from '../evaluation';
import { getArrayPaths } from '../evaluation/utils';

const applyDiff = (
  obj: Record<string, unknown>,
  ops: Diff<unknown>[] | undefined,
) => {
  if (!ops) return;
  for (const op of ops) {
    applyChange(obj, undefined, op);
  }
};

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
  // public errors: EntityErrorsRecord[string] = {};
  public runtimeErros: Record<string, string[]>;
  public evaluationValidationErrors: Record<string, string[]>;
  public inputValidationErrors: Record<string, string[]>;
  public actions: Record<string, (...args: unknown[]) => void> = {};
  public actionsConfig: EntityActionConfig;
  public rawActionsConfig: EntityActionRawConfig;
  private evaluablePaths: Set<string>;
  constructor({
    id,
    workerBroker,
    rawValues,
    inspectorConfig = [],
    publicAPI = new Set(),
    entityType: entityType,
    entityActionConfig = {},
    evaluablePaths = [],
  }: {
    id: string;
    entityType: EntityTypes;
    rawValues: Record<string, unknown>;
    inspectorConfig?: EntityInspectorConfig;
    evaluablePaths?: string[];
    publicAPI?: Set<string>;
    workerBroker: WorkerBroker;
    entityActionConfig?: EntityActionConfig;
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
      errors: computed,
      inputValidationErrors: observable,
      runtimeErros: observable,
      evaluationValidationErrors: observable,
      addInputValidationError: action,
      pushIntoArray: action,
      removeElementFromArray: action,
    });
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(inspectorConfig),
    ]);
    this.publicAPI = publicAPI;
    this.id = id;
    this.entityType = entityType;
    this.workerBroker = workerBroker;
    this.runtimeErros = {};
    this.evaluationValidationErrors = {};
    this.inputValidationErrors = {};
    this.actionsConfig = klona(entityActionConfig);
    this.rawActionsConfig = Object.entries(klona(entityActionConfig)).reduce(
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
    this.finalValues = klona(rawValues);
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

  applyEvalationUpdatePatch(ops: Diff<any>[]) {
    applyDiff(this.values, ops);
    const newFinalValues = klona(this.rawValues);
    for (const path of this.evaluablePaths) {
      let paths = [path];
      if (path.includes('[*]')) {
        paths = getArrayPaths(path, this.evaluablePaths, this.rawValues);
      }
      for (const path of paths) {
        const possibleEvalValue = get(this.values, path);
        if (possibleEvalValue === undefined) {
          const res = this.validatePath(path, get(this.rawValues, path));
          if (res) {
            set(newFinalValues, path, res.value);
            this.addInputValidationError(path, res.errors);
          } else {
            set(newFinalValues, path, get(this.rawValues, path));
            this.inputValidationErrors[path] = [];
          }
        } else {
          set(newFinalValues, path, possibleEvalValue);
          this.inputValidationErrors[path] = [];
        }
      }
    }
    const opsFinal = diff(this.finalValues, newFinalValues) || [];
    applyDiff(this.finalValues, opsFinal);
  }
  applyErrorUpdatePatch(
    ops: Diff<any>[],
    type: 'runtimeErrors' | 'evaluationValidationErrors',
  ) {
    if (type === 'runtimeErrors') {
      applyDiff(this.runtimeErros, ops);
    } else {
      applyDiff(this.evaluationValidationErrors, ops);
    }
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
  get errors() {
    return {
      evaluationValidationErrors: this.evaluationValidationErrors,
      runtimeErros: this.runtimeErros,
      inputValidationErrors: this.inputValidationErrors,
    };
  }
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
        this.addInputValidationError(path, res.errors);
        value = res.value;
      }
      set(this.finalValues, path, value);
    }
    this.debouncedSyncRawValuesWithEvaluationWorker(path);
  }
  pushIntoArray(path: string, value: unknown) {
    const array = get(this.rawValues, path) as unknown[];
    if (!isArray(array)) return;
    array.push(value);
    this.debouncedSyncRawValuesWithEvaluationWorker(path);
  }
  removeElementFromArray(path: string, index: number) {
    const array = get(this.rawValues, path) as unknown[];
    if (!isArray(array)) return;
    array.splice(index, 1);
    this.debouncedSyncRawValuesWithEvaluationWorker(path);
  }
  getValue(key: string) {
    return get(this.finalValues, key, get(this.rawValues, key));
  }
  addInputValidationError(path: string, errors: string[]) {
    this.inputValidationErrors[path] = errors;
  }

  getRawValue(key: string) {
    return get(this.rawValues, key);
  }

  get hasErrors() {
    for (const key in this.errors) {
      for (const path in this.errors[key as keyof typeof this.errors]) {
        // @ts-expect-error object keys
        if (this.errors[key][path].length > 0) return true;
      }
    }
    return false;
  }

  pathErrors(path: string) {
    return {
      evaluationValidationErrors: this.evaluationValidationErrors[path],
      runtimeErros: this.runtimeErros[path],
      inputValidationErrors: this.inputValidationErrors[path],
    };
  }

  pathHasErrors(path: string) {
    const errors = this.pathErrors(path);
    for (const key in errors) {
      if (errors[key as keyof typeof errors]?.length > 0) return true;
    }
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

  processActionConfig = (config: EntityActionConfig) => {
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
