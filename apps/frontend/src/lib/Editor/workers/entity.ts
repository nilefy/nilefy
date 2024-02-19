import { action, makeObservable, observable } from 'mobx';
import { DependencyManager } from './dependencyManager';

import { get, set } from 'lodash';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '@/lib/Editor/validations';
import { analyzeDependancies } from '../dependancyUtils';
import { EntityInspectorConfig } from '../interface';
import { getEvaluablePathsFromInspectorConfig } from '../evaluation';

export class Entity {
  private readonly evaluablePaths: Set<string>;
  public validators: Record<string, ReturnType<typeof ajv.compile>>;
  public unevalValues: Record<string, unknown>;
  public id: string;
  /**
   * merged rawVales and values(contains all props evaluated and not-evaluated)
   * use it to get the real values of some entity
   */
  public dependencyManager: DependencyManager;
  public validator?: ReturnType<typeof ajv.compile>;
  private readonly nestedPathPrefix?: string;
  public inspectorConfig: Record<string, unknown>[] | undefined;
  constructor({
    id,
    dependencyManager,
    unevalValues,
    evaluablePaths = [],
    nestedPathPrefix,
    inspectorConfig = [],
  }: {
    id: string;
    dependencyManager: DependencyManager;
    unevalValues: Record<string, unknown>;
    inspectorConfig: EntityInspectorConfig;
    evaluablePaths?: string[];
    nestedPathPrefix?: string;
  }) {
    makeObservable(this, {
      id: observable,
      dependencyManager: observable,
      unevalValues: observable,
      setValue: action,
      addDependencies: action,
      clearDependents: action,
      cleanup: action,
      analyzeAndApplyDependencyUpdate: action,
      applyDependencyUpdate: action,
      setValues: action,
      validatePath: action,
      initDependecies: action,
    });
    this.id = id;
    this.nestedPathPrefix = nestedPathPrefix;
    this.dependencyManager = dependencyManager;
    this.inspectorConfig = inspectorConfig;
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(
        inspectorConfig,
        nestedPathPrefix,
      ),
      ...Object.keys(unevalValues),
    ]);
    this.validators = extractValidators(inspectorConfig);
    this.unevalValues = unevalValues;
  }

  initDependecies() {
    const relations = this.analyzeDependencies();
    this.applyDependencyUpdate(relations);
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
    const value = get(this.unevalValues, path) as string;
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
      this.addDependencies(relation);
    }
  }

  analyzeAndApplyDependencyUpdate(path: string) {
    const relations = this.analyzeDependcyForPath(path);
    this.applyDependencyUpdate([relations]);
  }

  addDependencies(relations: ReturnType<typeof analyzeDependancies>) {
    this.dependencyManager.addDepenciesForProperty({
      ...relations,
      entityId: this.id,
    });
  }

  clearDependents() {
    this.dependencyManager.removeRelationshipsForEntity(this.id);
  }

  cleanup() {
    this.clearDependents();
  }

  setValue(path: string, value: unknown) {
    if (this.isPrefixed()) {
      path = this.nestedPathPrefix + '.' + path;
    }
    set(this.unevalValues, path, value);

    if (this.evaluablePaths.has(path)) {
      this.analyzeAndApplyDependencyUpdate(path);
    }
  }
  setValues(values: Record<string, unknown>) {
    for (const path in values) {
      this.setValue(path, values[path]);
    }
  }
  isPrefixed() {
    return this.nestedPathPrefix !== undefined;
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
