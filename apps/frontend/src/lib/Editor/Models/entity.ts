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
import { EntityErrors, EntityInspectorConfig, EntityTypes } from '../interface';
import { getEvaluablePathsFromInspectorConfig } from '../evaluation';

export class Entity implements RuntimeEvaluable, WebloomDisposable {
  readonly entityType: EntityTypes;
  private readonly evaluablePaths: Set<string>;
  private dispoables: Array<() => void> = [];
  public readonly inspectorConfig: EntityInspectorConfig;
  public values: Record<string, unknown>;
  rawValues: Record<string, unknown>;
  public id: string;
  public finalValues: Record<string, unknown>;

  public codePaths: Set<string>;
  private readonly nestedPathPrefix?: string;
  protected readonly workerBroker: WorkerBroker;
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
      errors: computed({
        requiresReaction: false,
      }),
    });
    this.id = id;
    this.entityType = entityType;
    this.nestedPathPrefix = nestedPathPrefix;
    this.workerBroker = workerBroker;
    this.rawValues = rawValues;
    this.finalValues = cloneDeep(rawValues);
    this.values = {};

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
      set(this.finalValues, path, value);
    }
    this.debouncedSyncRawValuesWithEvaluationWorker();
  }

  getValue(key: string) {
    return get(this.values, key, get(this.rawValues, key));
  }

  getRawValue(key: string) {
    return get(this.rawValues, key);
  }
  isPrefixed() {
    return this.nestedPathPrefix !== undefined;
  }

  get errors() {
    const errors: Record<string, EntityErrors> = {};
    for (const path of this.evaluablePaths) {
      const fullpath = this.id + '.' + path;
      const pathErrors = get(this.workerBroker.errors, fullpath);
      if (pathErrors) {
        set(errors, fullpath, pathErrors);
      }
    }
    return errors;
  }
  get prefixedRawValues() {
    return this.isPrefixed()
      ? get(this.rawValues, this.nestedPathPrefix as string)
      : this.rawValues;
  }
}
