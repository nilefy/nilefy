import { observable, makeObservable, action, computed, toJS } from 'mobx';
import invariant from 'invariant';
import { hasCyclicDependencies } from '../dependancyUtils';
import toposort from 'toposort';
import { WebloomPage } from './page';
import { evaluate } from '../evaluation';
import { get, set } from 'lodash';
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
      inverseDependencies: computed,
      graph: computed,
      evalTree: computed,
      page: observable,
    });
  }
  addDependencies(relations: Array<DependencyRelation>): void {
    for (const relation of relations) {
      this.addDependency(relation);
    }
  }
  addDependency(relationship: DependencyRelation): void {
    const { dependent, dependency } = relationship;
    const dependentPath = dependent.path;
    const dependencyPath = dependency.path;
    const dependentId = dependent.entityId;
    const dependencyId = dependency.entityId;
    if (
      this.detectCycle([
        ...this.graph,
        this.getGraphNodeForRelation(relationship),
      ] as [string, string][]).hasCycle
    ) {
      console.log('cycle detected');
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
    for (const dependentMap of this.dependencies.values()) {
      dependentMap.delete(entityId);
    }
  }
  get inverseDependencies(): Map<
    Dependency,
    Map<Dependent, Set<DependencyPath>>
  > {
    const dependents: Map<
      Dependency,
      Map<Dependent, Set<DependencyPath>>
    > = new Map();
    for (const [dependent, dependencyMap] of this.dependencies.entries()) {
      for (const [dependency, dependentMap] of dependencyMap.entries()) {
        for (const [dependentPath] of dependentMap.entries()) {
          if (!dependents.has(dependency)) {
            dependents.set(dependency, new Map());
          }
          const dependencyMap = dependents.get(dependency)!;
          if (!dependencyMap.has(dependent)) {
            dependencyMap.set(dependent, new Set());
          }
          const dependencyPathSet = dependencyMap.get(dependent)!;
          dependencyPathSet.add(dependentPath);
        }
      }
    }
    return dependents;
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
  get evalTree(): Record<string, unknown> {
    const sortedGraph = toposort(this.graph).reverse();
    const evalTree: Record<string, unknown> = {};
    for (const node of sortedGraph) {
      const [entityId, path] = node.split('.');
      const entity = this.page.getEntityById(entityId);
      invariant(
        entity,
        `entity with id ${entityId} not found while evaluating ${node}`,
      );
      if (!this.getDirectDependencies(entityId)) {
        set(evalTree, node, get(entity.rawValues, path));
        continue;
      }
      set(evalTree, node, evaluate(get(entity.rawValues, path), evalTree));
    }
    return evalTree;
  }
}
