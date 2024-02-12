import {
  observable,
  makeObservable,
  action,
  computed,
  autorun,
  when,
  toJS,
} from 'mobx';
import invariant from 'invariant';
import { analyzeDependancies, hasCyclicDependencies } from '../dependancyUtils';
import { concat, forEach, has } from 'lodash';
import { EditorState } from './editor';
// please note that path is something like "a.b.c"
type Path = string;
type EntityId = string;
type Dependent = EntityId;
type Dependency = EntityId;
type DependentPath = Path;
type DependencyPath = Path;
export type DependencyMap = Map<
  Dependent,
  Map<Dependency, Map<DependentPath, Set<DependencyPath>>>
>;
export type DependencyRelation = {
  // from is the dependent
  dependent: { entityId: EntityId; path: Path };
  // to is the dependency
  dependency: { entityId: EntityId; path: Path };
};
// thanks to appsmith for inspiration
export class DependencyManager {
  codeEntites: Set<EntityId> = new Set();
  dependencies: DependencyMap = new Map();
  editor: EditorState;
  constructor({ editor }: { editor: EditorState }) {
    this.editor = editor;

    makeObservable(this, {
      dependencies: observable,
      addDependency: action,
      removeRelationshipsForEntity: action,
      // inverseDependencies: computed, // we don't need this for now
      graph: computed,
      editor: observable,
      initAnalysis: action,
    });
    autorun(() => {
      console.log('dependencies', toJS(this.dependencies));
    });
  }
  initAnalysis() {
    forEach(this.editor.entities, (entity) => {
      entity.initDependecies();
    });
  }
  analyzeDependencies(
    args: Omit<Parameters<typeof analyzeDependancies>[0], 'keys'>,
  ) {
    return analyzeDependancies({ ...args, keys: this.editor.context });
  }

  /**
   * Add multiple dependencies for a single entity, (overwrites existing dependencies)
   * @param relations the dependent entity id in all relations must be the same and match caller or it will throw
   */
  addDependenciesForEntity(
    relations: Array<DependencyRelation>,
    caller: string,
  ): void {
    const dependentId = caller;
    this.dependencies.delete(dependentId);
    if (relations.length === 0) return;
    for (const relation of relations) {
      invariant(
        relation.dependent.entityId === dependentId,
        'entity id mismatch, all relations must have the same dependent entity id. if you want to add multiple dependencies for different entities, use addDependencies',
      );
      this.addDependency(relation);
    }
  }
  /**
   *
   * @description overwrites for a particular toProperty inside a particular entity
   */
  addDepenciesForProperty({
    dependencies,
    toProperty,
    entityId,
  }: Omit<ReturnType<typeof analyzeDependancies>, 'isCode'> & {
    entityId: string;
  }) {
    const dependentId = entityId;
    if (!this.dependencies.has(dependentId)) {
      this.dependencies.set(dependentId, new Map());
    }
    for (const item of this.dependencies.get(dependentId)!) {
      const [, relation] = item;
      relation.delete(toProperty);
    }
    for (const relation of dependencies) {
      this.addDependency(relation);
    }
  }

  addDependency(relationship: DependencyRelation): void {
    const { dependent, dependency } = relationship;
    const dependentPath = dependent.path;
    const dependencyPath = dependency.path;
    const dependentId = dependent.entityId;
    const dependencyId = dependency.entityId;
    const dependencyEntity = this.editor.getEntityById(dependencyId);
    const dependentEntity = this.editor.getEntityById(dependentId);
    invariant(
      dependentEntity,
      `dependent entity "${dependentId}" not found while adding dependency "${dependentId}" -> "${dependencyId}" on path "${dependentPath}"`,
    );
    invariant(
      dependencyEntity,
      `dependency entity "${dependencyId}" not found while adding dependency "${dependentId}" -> "${dependencyId}" on path "${dependencyPath}"`,
    );
    invariant(
      has(dependencyEntity.rawValues, dependencyPath),
      `dependency path "${dependencyPath}" not found on entity "${dependencyId}" while adding dependent "${dependentId}" -> "${dependencyId}" on path "${dependentPath}"`,
    );
    const cycle = this.detectCycle([
      ...this.graph,
      this.getGraphNodeForRelation(relationship),
    ] as [string, string][]);
    if (cycle.hasCycle) {
      console.log('cycle detected ', cycle.cycle);
      //todo: handle cycle
      // I don't know yet the business logic for handling cycles
      // so for now just return
      return;
    }
    if (!this.dependencies.has(dependentId)) {
      this.dependencies.set(dependentId, new Map());
    }
    const dependentMap = this.dependencies.get(dependentId)!;
    if (!dependentMap.has(dependencyId)) {
      dependentMap.set(dependencyId, new Map());
    }
    const dependencyMap = dependentMap.get(dependencyId)!;
    if (!dependencyMap.has(dependentPath)) {
      dependencyMap.set(dependentPath, new Set());
    }
    const dependencyPathSet = dependencyMap.get(dependentPath)!;
    dependencyPathSet.add(dependencyPath);
  }
  detectCycle(graph: [DependentPath, DependencyPath][]) {
    return hasCyclicDependencies(graph);
  }
  getDirectDependencies(entityId: EntityId) {
    return this.dependencies.get(entityId) || null;
  }

  removeRelationshipsForEntity(entityId: EntityId) {
    this.dependencies.delete(entityId);
    for (const item of this.dependencies.entries()) {
      const [dependentId, dependentMap] = item;
      dependentMap.delete(entityId);
      if (dependentMap.size === 0) {
        this.dependencies.delete(dependentId);
      }
    }
  }

  snapshot(): DependencyRelation[] {
    const relations: DependencyRelation[] = [];
    for (const [dependent, dependencyMap] of this.dependencies.entries()) {
      for (const [dependency, dependentMap] of dependencyMap.entries()) {
        for (const [
          dependentPath,
          dependencyPathSet,
        ] of dependentMap.entries()) {
          for (const dependencyPath of dependencyPathSet) {
            relations.push({
              dependent: { entityId: dependent, path: dependentPath },
              dependency: { entityId: dependency, path: dependencyPath },
            });
          }
        }
      }
    }
    return relations;
  }
  get graph(): [DependentPath, DependencyPath][] {
    const graph: [DependentPath, DependencyPath][] = [];
    for (const [dependent, dependencyMap] of this.dependencies.entries()) {
      for (const [dependency, dependentMap] of dependencyMap.entries()) {
        for (const [
          dependentPath,
          dependencyPathSet,
        ] of dependentMap.entries()) {
          for (const dependencyPath of dependencyPathSet) {
            console.log('here');
            graph.push([
              dependent + '.' + dependentPath,
              dependency + '.' + dependencyPath,
            ]);
          }
        }
      }
    }
    return graph;
  }

  private getGraphNodeForRelation(relation: DependencyRelation) {
    return [
      relation.dependent.entityId + '.' + relation.dependent.path,
      relation.dependency.entityId + '.' + relation.dependency.path,
    ];
  }
}
