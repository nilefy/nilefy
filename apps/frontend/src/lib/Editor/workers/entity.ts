import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { nanoid } from 'nanoid';
import { deepEqual } from 'fast-equals';
import { DependencyManager } from './dependencyManager';
import { get, isArray, keys, set } from 'lodash';
import {
  ajv,
  extractValidators,
  transformErrorToMessage,
} from '@/lib/Editor/validations';
import { analyzeDependancies } from '../evaluation/dependancyUtils';
import { EntityInspectorConfig, FunctionArgs, PublicApi } from '../interface';
import {
  getEvaluablePathsFromInspectorConfig,
  getGenericArrayPath,
} from '../evaluation';
import { EntityActionRawConfig } from '../evaluation/interface';
import { MainThreadBroker } from './mainThreadBroker';
import { getArrayPaths } from '../evaluation/utils';
import { WebloomDisposable } from '../Models/interface';
import { EditorState } from './editor';
import { jsonToTs } from './tsServer/conversions';

const addDescriptionIfPresent = (
  type: string,
  description: string | undefined,
) => {
  if (!description) return type;
  return `
  /**
   * ${description}
   * */
  ${type}
  `;
};

const defaultType = (path: string) => `const ${path}: unknown;`;
const functionType = (
  path: string,
  args: FunctionArgs | undefined,
  returns: string | undefined,
) => {
  if (Array.isArray(args)) {
    args = args
      .map((item) => `${item.name}${item.optional ? '?' : ''}: ${item.type}`)
      .join(', ');
  }
  if (!args) args = '';
  if (!returns) returns = 'void';
  return `const ${path}: (${args}) => ${returns};`;
};
const typedEntity = (path: string, type: string) => `const ${path}: ${type};`;
export class Entity implements WebloomDisposable {
  private readonly evaluablePaths: Set<string>;
  public unevalValues: Record<string, unknown>;
  public id: string;
  /**
   * merged rawVales and values(contains all props evaluated and not-evaluated)
   * use it to get the real values of some entity
   */
  private editorState: EditorState;
  public dependencyManager: DependencyManager;
  public validator?: ReturnType<typeof ajv.compile>;
  public inspectorConfig: Record<string, unknown>[] | undefined;
  public validators: Record<string, ReturnType<typeof ajv.compile>>;
  public readonly publicAPI: PublicApi;
  public actions: Record<string, (...args: unknown[]) => void> = {};
  private mainThreadBroker: MainThreadBroker;
  // these are the props that are set by the setter, we map the path to the old value.
  public setterProps: Record<string, unknown> = {};
  private metaValues: Set<string>;
  constructor({
    id,
    dependencyManager,
    mainThreadBroker,
    unevalValues,
    evaluablePaths = [],
    inspectorConfig = [],
    publicAPI = {},
    actionsConfig = {},
    metaValues = new Set(),
    editorState,
  }: {
    id: string;
    dependencyManager: DependencyManager;
    mainThreadBroker: MainThreadBroker;
    unevalValues: Record<string, unknown>;
    inspectorConfig: EntityInspectorConfig;
    evaluablePaths?: string[];
    publicAPI?: PublicApi;
    actionsConfig?: EntityActionRawConfig;
    metaValues?: Set<string>;
    editorState: EditorState;
  }) {
    makeObservable(this, {
      id: observable,
      dependencyManager: observable,
      unevalValues: observable,
      setterProps: observable,
      setValue: action,
      addDependencies: action,
      clearDependents: action,
      dispose: action,
      analyzeAndApplyDependencyUpdate: action,
      applyDependencyUpdate: action,
      setValues: action,
      initDependecies: action,
      tsType: computed,
      pathToType: computed,
    });
    this.metaValues = metaValues;
    this.mainThreadBroker = mainThreadBroker;
    this.editorState = editorState;
    this.actions = this.processActionConfig(actionsConfig);
    this.publicAPI = publicAPI;
    // add actions to the publicAPI
    for (const actionName in this.actions) {
      if (this.publicAPI[actionName]) continue;
      this.publicAPI[actionName] = {
        type: 'function',
        args: 'args: ...any[]',
        returns: 'void',
      };
    }
    this.id = id;
    this.dependencyManager = dependencyManager;
    this.inspectorConfig = inspectorConfig;
    this.evaluablePaths = new Set<string>([
      ...evaluablePaths,
      ...getEvaluablePathsFromInspectorConfig(inspectorConfig),
    ]);
    // events props cannot be dependcies to other props, so we have to keep track of them
    this.validators = extractValidators(inspectorConfig);
    this.unevalValues = unevalValues;
    this.initDependecies();
  }

  get pathToType() {
    const ret = Object.entries(this.publicAPI).reduce(
      (acc, [path, item]) => {
        if (item.type === 'static') {
          acc[path] = addDescriptionIfPresent(
            typedEntity(path, item.typeSignature),
            item.description,
          );
        } else if (item.type === 'function') {
          acc[path] = addDescriptionIfPresent(
            functionType(path, item.args, item.returns),
            item.description,
          );
        } else if (item.type === 'dynamic') {
          acc[path] = addDescriptionIfPresent(
            typedEntity(path, jsonToTs(path, get(this.unevalValues, path))),
            item.description,
          );
        } else {
          acc[path] = defaultType(path);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
    return ret;
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
      const res = this.analyzeDependcyForPath(path);
      if (!res) continue;
      relations.push(...res);
    }
    return relations;
  }

  analyzeDependcyForPath(
    path: string,
  ):
    | ReturnType<(typeof this.dependencyManager)['analyzeDependencies']>[]
    | null {
    let pathesToAnalyze: string[] = [];
    let _path = path;
    const isGenericArrayPath = _path.includes('[*]');
    const valueIsArray = isArray(get(this.unevalValues, _path));
    // if path is the entire array we need to check if the path of that array can be generic
    if (valueIsArray) {
      const arr = get(this.unevalValues, _path) as Record<string, unknown>[];
      _path += '[*]';
      if (arr.length === 0) return null;

      const pathesToAnalyze = keys(arr[0]).map((key) => `${_path}.${key}`);
      return pathesToAnalyze
        .flatMap((path) => this.analyzeDependcyForPath(path))
        .filter((i) => i !== null);
    }
    //check if path is an array path ex. a[0].b, notice that a[*].b doesn't hit this condition
    const genericArrayPathCandidate =
      !this.evaluablePaths.has(_path) && !isGenericArrayPath;
    if (genericArrayPathCandidate) {
      // A candidate for array path
      _path = getGenericArrayPath(path);
    }

    if (
      (genericArrayPathCandidate || isGenericArrayPath) &&
      this.evaluablePaths.has(_path)
    ) {
      const pathsToAnalyze = getArrayPaths(
        _path,
        this.evaluablePaths,
        this.unevalValues,
      );

      if (!pathsToAnalyze.length) return null;
      pathesToAnalyze = pathsToAnalyze;
    } else if (this.evaluablePaths.has(path)) {
      pathesToAnalyze = [path];
    } else {
      return null;
    }
    const relations = pathesToAnalyze.map((path) => {
      const value = get(this.unevalValues, path) as string;
      return this.dependencyManager.analyzeDependencies({
        code: value,
        entityId: this.id,
        toProperty: path,
      });
    });
    return relations;
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
    if (relations) {
      this.applyDependencyUpdate(relations);
    }
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

  async dispose() {
    this.clearDependents();
    const keysToBeRemovedFromTsServer = this.allEvaluablePaths;
    const tsServer = await this.editorState.tsServer;
    for (const key of keysToBeRemovedFromTsServer) {
      tsServer.deleteFile(this.id + '_' + key);
    }
  }

  setValue(path: string, value: unknown) {
    if (value !== undefined && deepEqual(this.setterProps[path], value)) {
      return;
    } else {
      delete this.setterProps[path];
    }
    set(this.unevalValues, path, value);
    this.analyzeAndApplyDependencyUpdate(path);
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
        actions[key] = async (value: unknown) => {
          if (this.metaValues.has(configItem.path)) {
            return await this.createPromiseForAction(this.id, key, [value]);
          }
          runInAction(() => {
            const path = configItem.path;
            if ('value' in configItem) {
              value = configItem.value;
            }
            this.setValue(path, value);
            this.setterProps[path] = this.unevalValues[path];
          });
        };
      } else if (configItem.type === 'SIDE_EFFECT') {
        actions[key] = async (...args: unknown[]) => {
          await this.createPromiseForAction(this.id, key, args);
        };
      }
    }
    return actions;
  };

  createPromiseForAction = (
    entityId: string,
    actionName: string,
    args: unknown[] = [],
  ) => {
    return new Promise((resolve, reject) => {
      this.mainThreadBroker.addAction({
        entityId,
        actionName,
        args,
        id: nanoid(),
        resolve,
        reject,
      });
    });
  };

  get tsType(): string | null {
    let generatedType = '';
    // types haven't been initialized yet
    if (!this.pathToType) return null;
    for (const path in this.pathToType) {
      generatedType += this.pathToType[path] + '\n';
    }
    const finalType = `declare namespace ${this.id} {
      ${generatedType}
    }`;
    return finalType;
  }

  /**
   * get all the paths that can be evaluated including the array paths
   * currently handles only one level of array paths
   */
  get allEvaluablePaths() {
    const genericArrayPaths = new Set<string>();
    const correctPaths = new Set<string>();
    for (const path of this.evaluablePaths) {
      if (path.includes('[*]')) {
        genericArrayPaths.add(path);
      } else {
        correctPaths.add(path);
      }
    }
    for (const path of genericArrayPaths) {
      const [arrayPath, evaluablePath] = path.split('[*]');
      const arr = get(this.unevalValues, arrayPath, []) as Record<
        string,
        unknown
      >[];
      if (!arr.length) continue;
      let i = 0;
      for (const key in arr[0]) {
        correctPaths.add(`${evaluablePath}[${i}].${key}`);
        i++;
      }
    }
    return [...correctPaths];
  }
}
