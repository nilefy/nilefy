import { action, makeObservable, observable, runInAction } from 'mobx';
import { deepEqual } from 'fast-equals';

import { DependencyManager } from './dependencyManager';

import { get, set } from 'lodash';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '@/lib/Editor/validations';
import { analyzeDependancies } from '../evaluation/dependancyUtils';
import { EntityInspectorConfig } from '../interface';
import { getEvaluablePathsFromInspectorConfig } from '../evaluation';
import { EntityActionRawConfig } from '../evaluation/interface';
import { MainThreadBroker } from './mainThreadBroker';

export class Entity {
  private readonly evaluablePaths: Set<string>;
  public unevalValues: Record<string, unknown>;
  public id: string;
  /**
   * merged rawVales and values(contains all props evaluated and not-evaluated)
   * use it to get the real values of some entity
   */
  public dependencyManager: DependencyManager;
  public validator?: ReturnType<typeof ajv.compile>;
  public inspectorConfig: Record<string, unknown>[] | undefined;
  public validators: Record<string, ReturnType<typeof ajv.compile>>;
  public readonly publicAPI: Set<string>;
  public actions: Record<string, (...args: unknown[]) => void> = {};
  private mainThreadBroker: MainThreadBroker;
  // these are the props that are set by the setter, we map the path to the old value.
  public setterProps: Record<string, unknown> = {};
  constructor({
    id,
    dependencyManager,
    mainThreadBroker,
    unevalValues,
    evaluablePaths = [],
    inspectorConfig = [],
    publicAPI = new Set(),
    actionsConfig = {},
  }: {
    id: string;
    dependencyManager: DependencyManager;
    mainThreadBroker: MainThreadBroker;
    unevalValues: Record<string, unknown>;
    inspectorConfig: EntityInspectorConfig;
    evaluablePaths?: string[];
    publicAPI?: Set<string>;
    actionsConfig?: EntityActionRawConfig;
  }) {
    makeObservable(this, {
      id: observable,
      dependencyManager: observable,
      unevalValues: observable,
      setterProps: observable,
      setValue: action,
      addDependencies: action,
      clearDependents: action,
      cleanup: action,
      analyzeAndApplyDependencyUpdate: action,
      applyDependencyUpdate: action,
      setValues: action,
      initDependecies: action,
    });
    this.mainThreadBroker = mainThreadBroker;
    this.actions = this.processActionConfig(actionsConfig);
    this.publicAPI = publicAPI;
    // add actions to the publicAPI
    for (const actionName in this.actions) {
      this.publicAPI.add(actionName);
    }
    this.id = id;
    this.dependencyManager = dependencyManager;
    this.inspectorConfig = inspectorConfig;
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(inspectorConfig),
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
    if (deepEqual(this.setterProps[path], value)) {
      return;
    } else {
      delete this.setterProps[path];
    }
    set(this.unevalValues, path, value);
    if (this.evaluablePaths.has(path)) {
      this.analyzeAndApplyDependencyUpdate(path);
    }
  }
  setValues(values: Record<string, unknown>) {
    for (const path in values) {
      set(this.unevalValues, path, values[path]);
    }
    for (const path of this.evaluablePaths) {
      this.analyzeAndApplyDependencyUpdate(path);
    }
  }
  getEvent(eventName: string) {
    return this.unevalValues[eventName] as string;
  }
  processActionConfig = (config: EntityActionRawConfig) => {
    const actions: Record<string, (...args: unknown[]) => void> = {};
    for (const key in config) {
      const configItem = config[key];
      if (configItem.type === 'SETTER') {
        actions[key] = (value: unknown) => {
          runInAction(() => {
            const path = configItem.path;
            this.setValue(path, value);
            this.setterProps[path] = this.unevalValues[path];
          });
        };
      } else if (configItem.type === 'SIDE_EFFECT') {
        actions[key] = (...args: unknown[]) => {
          this.mainThreadBroker.addEvent({
            id: this.id,
            actionName: key,
            args,
          });
        };
      }
    }
    return actions;
  };
}
