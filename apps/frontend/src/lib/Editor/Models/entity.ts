import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';

import { RuntimeEvaluable, WebloomDisposable } from './interfaces';
import {
  cloneDeep,
  debounce,
  get,
  isPlainObject,
  memoize,
  merge,
  set,
} from 'lodash';
import { ajv } from '@/lib/validations';
import { WorkerRequest } from '../workers/common/interface';
import { WorkerBroker } from './workerBroker';

function createPathFromStack(stack: string[]) {
  return stack.join('.');
}
const evaluationFormControls = new Set(['sql', 'inlinceCodeInput']);
const getEvaluablePathsFromSchema = memoize(
  (schema: Record<string, unknown> | undefined, nestedPathPrefix?: string) => {
    if (!schema) return [];
    const stack: string[] = [];
    const result: string[] = [];
    // the actual function that do the recursion
    const helper = (
      obj: Record<string, unknown>,
      stack: string[],
      result: string[],
    ) => {
      const isLastLevel = Object.keys(obj).every((k) => !isPlainObject(obj[k]));
      if (isLastLevel) {
        if (evaluationFormControls.has(obj['ui:widget'] as string)) {
          let path = createPathFromStack(stack);
          if (nestedPathPrefix) {
            path = nestedPathPrefix + '.' + path;
          }
          result.push(path);
        }
        return;
      }
      for (const k in obj) {
        stack.push(k);
        const item = obj[k];
        if (isPlainObject(item)) {
          helper(item, stack, result);
        }
        stack.pop();
      }
    };
    helper(schema, stack, result);
    return result;
  },
);

export type EntitySchema = {
  uiSchema?: Record<string, unknown>;
  dataSchema?: Record<string, unknown>;
  metaSchema?: Record<string, unknown>;
};

export class Entity implements RuntimeEvaluable, WebloomDisposable {
  readonly entityType: string;
  private readonly evaluablePaths: Set<string>;
  private dispoables: Array<() => void> = [];
  public readonly schema: EntitySchema;
  public values: Record<string, unknown>;
  rawValues: Record<string, unknown>;
  public id: string;
  public finalValues: Record<string, unknown>;

  public codePaths: Set<string>;
  public validator?: ReturnType<typeof ajv.compile>;
  private readonly nestedPathPrefix?: string;
  protected readonly workerBroker: WorkerBroker;
  constructor({
    id,
    workerBroker,
    rawValues,
    schema = {},
    tempRemoveMeFast,
    evaluablePaths = [],
    nestedPathPrefix,
    entityType: entityType,
  }: {
    id: string;
    entityType: string;
    rawValues: Record<string, unknown>;
    schema?: EntitySchema;
    tempRemoveMeFast?: boolean;
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
    });
    this.id = id;
    this.entityType = entityType;
    this.nestedPathPrefix = nestedPathPrefix;
    this.workerBroker = workerBroker;
    this.rawValues = rawValues;
    this.finalValues = cloneDeep(rawValues);
    this.values = {};
    if (tempRemoveMeFast) {
      evaluablePaths = Object.keys(rawValues);
    }
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromSchema(schema?.uiSchema || {}, nestedPathPrefix),
    ]);
    this.codePaths = new Set<string>();
    this.schema = schema;
    if (schema?.dataSchema) {
      this.validator = ajv.compile(schema.dataSchema);
    }
    if (schema?.uiSchema) {
      const additionalUISchema = {
        'ui:options': {
          submitButtonOptions: {
            norender: true,
          },
        },
      };
      schema.uiSchema = merge({}, schema.uiSchema, additionalUISchema);
    }
    this.dispoables.push(
      ...[
        reaction(() => this.rawValues, this.syncRawValuesWithEvaluationWorker),
        reaction(() => {
          for (const path of this.evaluablePaths) {
            const possiblyNewValue = get(
              this.workerBroker.evalForest,
              this.id + '.' + path,
            );
            if (possiblyNewValue === undefined) continue;
            if (get(this.finalValues, path) !== possiblyNewValue) {
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
          config: [],
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
  get validationErrors() {
    return [];
  }

  get prefixedRawValues() {
    return this.isPrefixed()
      ? get(this.rawValues, this.nestedPathPrefix as string)
      : this.rawValues;
  }
}
