import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';

import { DependencyManager, DependencyRelation } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import { RuntimeEvaluable } from './interfaces';
import { debounce, get, set, unset } from 'lodash';
import { isObject } from '../utils';
import { ajv } from '@/lib/validations';
import { toErrorList } from '@rjsf/utils';
import { transformRJSFValidationErrors } from '@rjsf/validator-ajv8/lib/processRawValidationErrors';
function createPathFromStack(stack: string[]) {
  return stack.join('.');
}
const evaluationFormControls = new Set(['sql', 'inlinceCodeInput']);
const getEvaluablePathsFromSchema = (
  schema: Record<string, unknown> | undefined,
) => {
  if (!schema) return [];
  const stack: string[] = [];
  const result: string[] = [];
  // the actual function that do the recursion
  const helper = (
    obj: Record<string, unknown>,
    stack: string[],
    result: string[],
  ) => {
    const isLastLevel = Object.keys(obj).every((k) => !isObject(obj[k]));
    if (isLastLevel) {
      if (evaluationFormControls.has(obj['ui:widget'] as string)) {
        result.push(createPathFromStack(stack));
      }
      return;
    }
    for (const k in obj) {
      stack.push(k);
      const item = obj[k];
      if (isObject(item)) {
        helper(item, stack, result);
      }
      stack.pop();
    }
  };
  helper(schema, stack, result);
  return result;
};

export type EntitySchema = {
  uiSchema?: Record<string, unknown>;
  dataSchema?: Record<string, unknown>;
  metaSchema?: Record<string, unknown>;
};
export class Entity implements RuntimeEvaluable {
  private readonly evaluablePaths: Set<string>;
  private dispoables: Array<() => void> = [];
  public schema: EntitySchema = {};
  public values: Record<string, unknown>;
  rawValues: Record<string, unknown>;
  public id: string;
  public dependencyManager: DependencyManager;
  public evaluationManger: EvaluationManager;
  public codePaths: Set<string>;
  public validator?: ReturnType<typeof ajv.compile>;
  constructor({
    id,
    dependencyManager,
    evaluationManger,
    rawValues,
    schema,
    tempRemoveMeFast,
    evaluablePaths = [],
  }: {
    id: string;
    dependencyManager: DependencyManager;
    evaluationManger: EvaluationManager;
    rawValues: Record<string, unknown>;
    schema?: EntitySchema;
    tempRemoveMeFast?: boolean;
    evaluablePaths?: string[];
  }) {
    makeObservable(this, {
      id: observable,
      dependencyManager: observable,
      evaluationManger: observable,
      rawValues: observable,
      values: observable,
      codePaths: observable,
      finalValues: computed,
      applyEvaluationUpdates: action.bound,
      setValue: action,
      setValueIsCode: action,
      addDependencies: action,
      clearDependents: action,
      cleanup: action,
      analyzeAndApplyDependencyUpdate: action,
      debouncedAnalyzeAndApplyDependencyUpdate: action,
      applyDependencyUpdate: action,
    });
    this.id = id;
    this.dependencyManager = dependencyManager;
    this.evaluationManger = evaluationManger;
    this.rawValues = rawValues;
    this.values = {};
    if (tempRemoveMeFast) {
      evaluablePaths = Object.keys(rawValues);
    }
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromSchema(schema?.uiSchema || {}),
    ]);
    this.codePaths = new Set<string>();
    if (schema?.dataSchema) {
      this.validator = ajv.compile(schema.dataSchema);
    }
    this.dispoables.push(
      reaction(
        () => evaluationManger.evaluatedForest,
        this.applyEvaluationUpdates,
      ),
      autorun(() => {
        console.log(
          `-------------------------- ${this.id} start --------------------------`,
        );
        console.log('this.evaluablePaths', toJS(this.evaluablePaths));
        console.log('this.values', toJS(this.values));
        console.log('this.rawValues', toJS(this.rawValues));
        console.log('this.codePaths', toJS(this.codePaths));
        console.log('this.finalValues', toJS(this.finalValues));
        console.log(
          `-------------------------- ${this.id} end --------------------------`,
        );
      }),
    );
  }
  analyzeDependencies() {
    const relations: ReturnType<
      (typeof this.dependencyManager)['analyzeDependencies']
    >[] = [];
    for (const path of this.evaluablePaths) {
      relations.push(this.analyzeDependcyForPath(path));
    }
    return relations;
  }

  analyzeDependcyForPath(path: string) {
    const value = get(this.rawValues, path) as string;
    return this.dependencyManager.analyzeDependencies({
      code: value,
      entityId: this.id,
      toProperty: path,
    });
  }

  applyDependencyUpdate(
    relations: ReturnType<
      (typeof this.dependencyManager)['analyzeDependencies']
    >[],
  ) {
    for (const relation of relations) {
      this.setValueIsCode(relation.toProperty, relation.isCode);
      this.addDependencies(relation.dependencies);
    }
  }

  analyzeAndApplyDependencyUpdate(path: string) {
    const relations = this.analyzeDependcyForPath(path);
    this.applyDependencyUpdate([relations]);
  }

  debouncedAnalyzeAndApplyDependencyUpdate = debounce(
    this.analyzeAndApplyDependencyUpdate,
    2000,
  );

  applyEvaluationUpdates() {
    for (const path of this.codePaths) {
      set(
        this.values,
        path,
        get(this.evaluationManger.evaluatedForest, this.id + '.' + path),
      );
    }
  }

  setValueIsCode(key: string, isCode: boolean) {
    this.evaluationManger.setRawValueIsCode(this.id, key, isCode);
    if (isCode) {
      this.codePaths.add(key);
      return;
    }
    this.codePaths.delete(key);
    unset(this.values, key);
  }

  addDependencies(relations: Array<DependencyRelation>) {
    this.dependencyManager.addDependenciesForEntity(relations, this.id);
  }

  clearDependents() {
    this.dependencyManager.removeRelationshipsForEntity(this.id);
  }

  cleanup() {
    this.clearDependents();
    this.dispoables.forEach((dispose) => dispose());
  }

  setValue(path: string, value: unknown) {
    set(this.rawValues, path, value);
    if (this.evaluablePaths.has(path)) {
      this.analyzeAndApplyDependencyUpdate(path);
    }
  }

  getValue(key: string) {
    return get(this.values, key, get(this.rawValues, key));
  }

  getRawValue(key: string) {
    return get(this.rawValues, key);
  }
  get validationErrors() {
    if (!this.validator) return [];
    const isValid = this.validator(this.values);
    if (isValid) return [];
    return transformRJSFValidationErrors(this.validator.errors || []);
  }
  get finalValues() {
    return {
      ...this.rawValues,
      ...this.values,
    };
  }
}
