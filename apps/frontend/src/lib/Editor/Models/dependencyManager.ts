import {
  observable,
  makeObservable,
  action,
  computed,
  autorun,
  toJS,
} from 'mobx';
import invariant from 'invariant';
import { hasCyclicDependencies } from '../dependancyUtils';
import { WebloomPage } from './page';
import { has } from 'lodash';
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
  page: WebloomPage;
  constructor({
    relations,
    page,
  }: {
    relations?: Array<DependencyRelation>;
    page: WebloomPage;
  }) {
    this.page = page;
    if (relations) {
      for (const relation of relations) {
        this.addDependency(relation);
      }
    }
    makeObservable(this, {
      dependencies: observable,
      addDependency: action,
      addDependencies: action,
      removeDependency: action,
      removeRelationshipsForEntity: action,
      // inverseDependencies: computed, // we don't need this for now
      graph: computed,
      page: observable,
    });
  }

  /**
   * Add multiple dependencies (doesn't overwrite so don't use it unless initialising)
   */
  addDependencies(relations: Array<DependencyRelation>): void {
    for (const relation of relations) {
      this.addDependency(relation);
    }
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
  addDependency(relationship: DependencyRelation): void {
    const { dependent, dependency } = relationship;
    const dependentPath = dependent.path;
    const dependencyPath = dependency.path;
    const dependentId = dependent.entityId;
    const dependencyId = dependency.entityId;
    const dependencyEntity = this.page.getEntityById(dependencyId);
    const dependentEntity = this.page.getEntityById(dependentId);
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
  removeDependency(relationship: DependencyRelation): void {
    const { dependent, dependency } = relationship;
    const dependentPath = dependent.path;
    const dependencyPath = dependency.path;
    const dependentId = dependent.entityId;
    const dependencyId = dependency.entityId;
    if (!this.dependencies.has(dependentId)) {
      return;
    }
    const dependentMap = this.dependencies.get(dependentId)!;
    if (!dependentMap.has(dependencyId)) {
      return;
    }
    const dependencyMap = dependentMap.get(dependencyId)!;
    if (!dependencyMap.has(dependentPath)) {
      return;
    }
    const dependencyPathSet = dependencyMap.get(dependentPath)!;
    dependencyPathSet.delete(dependencyPath);
    if (dependencyPathSet.size === 0) {
      dependencyMap.delete(dependentPath);
    }
    if (dependencyMap.size === 0) {
      dependentMap.delete(dependencyId);
    }
    if (dependentMap.size === 0) {
      this.dependencies.delete(dependentId);
    }
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
