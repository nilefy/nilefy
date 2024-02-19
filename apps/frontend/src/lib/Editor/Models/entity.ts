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

export class Entity implements RuntimeEvaluable, WebloomDisposable {
  readonly entityType: EntityTypes;
  private readonly evaluablePaths: Set<string>;
  private dispoables: Array<() => void> = [];
  public readonly inspectorConfig: EntityInspectorConfig;
  public values: Record<string, unknown>;
  rawValues: Record<string, unknown>;
  public id: string;
  public finalValues: Record<string, unknown>;
  public validators: Record<string, ReturnType<typeof ajv.compile>>;
  public codePaths: Set<string>;
  private readonly nestedPathPrefix?: string;
  protected readonly workerBroker: WorkerBroker;
  public errors: EntityErrorsRecord[string] = {};
  constructor({
    id,
    workerBroker,
    rawValues,
    inspectorConfig = [],
    evaluablePaths = [],
    nestedPathPrefix,
    entityType: entityType,
  }: {
    id: string;
    entityType: EntityTypes;
    rawValues: Record<string, unknown>;
    inspectorConfig?: EntityInspectorConfig;
    evaluablePaths?: string[];
    nestedPathPrefix?: string;
    workerBroker: WorkerBroker;
  }) {
    makeObservable(this, {
      id: observable,
      rawValues: observable,
      values: observable,
      codePaths: observable,
      finalValues: observable,
      applyEvaluationUpdates: action.bound,
      setValue: action,
      dispose: action,
      prefixedRawValues: computed,
      hasErrors: computed,
      errors: observable,
    });
    this.id = id;
    this.entityType = entityType;
    this.nestedPathPrefix = nestedPathPrefix;
    this.workerBroker = workerBroker;
    this.rawValues = rawValues;
    this.finalValues = cloneDeep(rawValues);
    this.values = {};
    this.validators = extractValidators(inspectorConfig);

    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(inspectorConfig),
    ]);
    this.codePaths = new Set<string>();
    this.inspectorConfig = inspectorConfig;
    this.dispoables.push(
      ...[
        reaction(() => this.rawValues, this.syncRawValuesWithEvaluationWorker),
        reaction(() => {
          for (const path of this.evaluablePaths) {
            const possiblyNewValue = get(
              this.workerBroker.evalForest,
              this.id + '.' + path,
            );
            if (get(this.values, path) !== possiblyNewValue) {
              return true;
            }
          }
          return false;
        }, this.applyEvaluationUpdates),
      ],
    );
    this.workerBroker.postMessege({
      event: 'addEntity',
      body: {
        entityType: this.entityType,
        config: {
          unevalValues: toJS(this.rawValues),
          inspectorConfig: this.inspectorConfig,
          id: this.id,
          nestedPathPrefix: this.nestedPathPrefix,
        },
      },
    });
  }

  applyEvaluationUpdates() {
    for (const path of this.evaluablePaths) {
      let value = get(this.workerBroker.evalForest, this.id + '.' + path);
      const res = this.validatePath(path, value);
      if (res) {
        this.addValidationErrors(path, res.errors);
        value = res.value;
      }
      set(
        this.values,
        path,
        get(this.workerBroker.evalForest, this.id + '.' + path),
      );
      set(
        this.finalValues,
        path,
        get(this.values, path, get(this.rawValues, path)),
      );
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
    500,
  );
  setValue(path: string, value: unknown) {
    if (this.isPrefixed()) {
      path = this.nestedPathPrefix + '.' + path;
    }
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
  isPrefixed() {
    return this.nestedPathPrefix !== undefined;
  }

  get hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  pathErrors(path: string) {
    return this.errors[path];
  }

  pathHasErrors(path: string) {
    return !!this.errors[path];
  }

  get prefixedRawValues() {
    return this.isPrefixed()
      ? get(this.rawValues, this.nestedPathPrefix as string)
      : this.rawValues;
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
