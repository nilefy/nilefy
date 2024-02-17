import { action, makeObservable, observable } from 'mobx';
import { DependencyManager } from './dependencyManager';

import { get, memoize, set } from 'lodash';
// import { ajv } from '@/lib/validations';
import { analyzeDependancies } from '../dependancyUtils';

const getEvaluablePathsFromSchema = memoize(
  (
    config: Record<string, unknown>[] | undefined,
    nestedPathPrefix?: string,
  ) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (evaluationFormControls.has(control.type)) {
          let path = control.key;
          if (nestedPathPrefix) {
            path = nestedPathPrefix + '.' + path;
          }
          paths.push(path);
        }
      }
    }
    return paths;
  },
);

const extractValidators = memoize(
  (config: Record<string, unknown>[] | undefined) => {
    if (!config) return {};
    const schemas: Record<string, unknown> = {};
    for (const section of config) {
      for (const control of section.children) {
        if (control.validation) {
          schemas[control.key] = control.validation;
        }
      }
    }
    const compiledValidators: Record<
      string,
      ReturnType<typeof ajv.compile>
    > = {};
    for (const key in schemas) {
      compiledValidators[key] = ajv.compile(schemas[key]);
    }
    return compiledValidators;
  },
);
const evaluationFormControls = new Set(['sql', 'inlineCodeInput']);

export type EntitySchema = {
  uiSchema?: Record<string, unknown>;
  dataSchema?: Record<string, unknown>;
  metaSchema?: Record<string, unknown>;
};

export class Entity {
  private readonly evaluablePaths: Set<string>;
  public validations: Record<string, ReturnType<typeof ajv.compile>>;
  public unevalValues: Record<string, unknown>;
  public id: string;
  /**
   * merged rawVales and values(contains all props evaluated and not-evaluated)
   * use it to get the real values of some entity
   */
  public dependencyManager: DependencyManager;
  public validator?: ReturnType<typeof ajv.compile>;
  private readonly nestedPathPrefix?: string;
  public config: Record<string, unknown>[] | undefined;
  constructor({
    id,
    dependencyManager,
    unevalValues,
    evaluablePaths = [],
    nestedPathPrefix,
    config = [],
  }: {
    id: string;
    dependencyManager: DependencyManager;
    unevalValues: Record<string, unknown>;
    config: any;
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
    });
    this.id = id;
    this.nestedPathPrefix = nestedPathPrefix;
    this.dependencyManager = dependencyManager;
    this.config = config;
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromSchema(config, nestedPathPrefix),
      // !remove me
      ...Object.keys(unevalValues),
    ]);

    this.validations = extractValidators(config);
    this.unevalValues = unevalValues;
  }

  initDependecies() {
    const relations = this.analyzeDependencies();
    this.dependencyManager.addDependenciesForEntity(
      relations.flatMap((i) => i.dependencies),
      this.id,
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
}
