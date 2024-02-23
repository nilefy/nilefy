import { observable, makeObservable, action, computed } from 'mobx';
import { analyzeDependancies } from '../dependancyUtils';
import { forEach } from 'lodash';
import { EditorState } from './editor';

export class DepGraph {
  paths = new Set<string>();
  outgoingPathsEdges = new Map<string, string[]>();

  incomingPathsEdges = new Map<string, string[]>();
  circular: boolean;

  /**
   * Helper for creating a Topological Sort using Depth-First-Search on a set of edges.
   *
   * Detects cycles and throws an Error if one is detected (unless the "circular"
   * parameter is "true" in which case it ignores them).
   *
   * @param edges The edges to DFS through (this is a Map of node to Array of nodes)
   * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
   * @param result An array in which the results will be populated
   * @param circular A boolean to allow circular dependencies
   */
  static createDFS(
    edges: Map<string, string[]>,
    leavesOnly: boolean,
    result: string[],
    circular: boolean,
  ) {
    const visited = new Set();
    return function (start: string) {
      if (visited.has(start)) {
        return;
      }
      const inCurrentPath = new Set();
      const currentPath = [];
      const todo = []; // used as a stac
      todo.push({ node: start, processed: false });
      while (todo.length > 0) {
        const current = todo[todo.length - 1]; // peek at the todo stack
        const processed = current.processed;
        const node = current.node;
        if (!processed) {
          // Haven't visited edges yet (visiting phase)
          if (visited.has(node)) {
            todo.pop();
            continue;
          } else if (inCurrentPath.has(node)) {
            // It's not a DAG
            if (circular) {
              todo.pop();
              // If we're tolerating cycles, don't revisit the node
              continue;
            }
            currentPath.push(node);
            throw new DepGraphCycleError(currentPath);
          }

          inCurrentPath.add(node);
          currentPath.push(node);
          const nodeEdges = edges.get(node);
          // (push edges onto the todo stack in reverse order to be order-compatible with the old DFS implementation)
          for (let i = nodeEdges!.length - 1; i >= 0; i--) {
            todo.push({ node: nodeEdges![i], processed: false });
          }
          current.processed = true;
        } else {
          // Have visited edges (stack unrolling phase)
          todo.pop();
          currentPath.pop();
          inCurrentPath.delete(node);
          visited.add(node);
          if (!leavesOnly || edges.get(node)!.length === 0) {
            result.push(node);
          }
        }
      }
    };
  }

  constructor(circular = false) {
    this.circular = circular;
    makeObservable(this, {
      paths: observable,
      outgoingPathsEdges: observable,
      incomingPathsEdges: observable,
      circular: observable,
      size: computed,
      addPath: action,
      removePath: action,
      addDependency: action,
      removeDependency: action,
      overAllOrderAllNodes: computed,
      entryNodes: computed,
      removeEntity: action,
      // while this is technically a getter, it's marked as an action because it does some mutation (which it reverts)
      // but I want mobx to not cause reactions to run when this is called
      willCauseCycle: action,
      clearIncomingEdgesForEntity: action,
      clearOutgoingEdgesForEntity: action,
      clearIncomingEdgesForPath: action,
      clearOutgoingEdgesForPath: action,
    });
  }

  clearIncomingEdgesForPath(path: string) {
    if (!this.incomingPathsEdges.has(path)) return;
    this.incomingPathsEdges.set(path, []);
    if (this.directDependentsOfPath(path).length === 0) {
      this.removePath(path);
    }
  }
  clearOutgoingEdgesForPath(path: string) {
    if (!this.incomingPathsEdges.has(path)) return;
    this.outgoingPathsEdges.set(path, []);
    if (this.directDependenciesOfPath(path).length === 0) {
      this.removePath(path);
    }
  }

  clearIncomingEdgesForEntity(entityId: string) {
    for (const path of this.paths) {
      const [id] = path.split('.');
      if (id === entityId) {
        this.clearIncomingEdgesForPath(path);
      }
    }
  }
  clearOutgoingEdgesForEntity(entityId: string) {
    for (const path of this.paths) {
      const [id] = path.split('.');
      if (id === entityId) {
        this.clearOutgoingEdgesForPath(path);
      }
    }
  }

  /**
   * The number of nodes in the graph.
   */
  get size(): number {
    return this.paths.size;
  }

  /**
   * Add a node to the dependency graph. If a node already exists, this method will do nothing.
   */
  addPath(node: string): void {
    if (!this.hasNode(node)) {
      this.paths.add(node);

      this.outgoingPathsEdges.set(node, []);
      this.incomingPathsEdges.set(node, []);
    }
  }

  /**
   * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
   */
  removePath(node: string): void {
    if (this.hasNode(node)) {
      this.paths.delete(node);
      this.outgoingPathsEdges.delete(node);
      this.incomingPathsEdges.delete(node);
      [this.incomingPathsEdges, this.outgoingPathsEdges].forEach((edgeList) => {
        edgeList.forEach((v: string[]) => {
          const idx = v.indexOf(node);
          if (idx >= 0) {
            v.splice(idx, 1);
          }
        });
      });
    }
  }

  /**
   * Check if a node exists in the graph
   */
  hasNode(node: string): boolean {
    return this.paths.has(node);
  }

  /**
   * Add a dependency between two nodes. If either of the nodes does not exist,
   * an Error will be thrown.
   */
  addDependency(dependency: string, dependent: string) {
    if (!this.hasNode(dependency)) {
      throw new Error('Node does not exist: ' + dependency);
    }
    if (!this.hasNode(dependent)) {
      throw new Error('Node does not exist: ' + dependent);
    }
    if (this.outgoingPathsEdges.get(dependency)?.indexOf(dependent) === -1) {
      // @ts-expect-error we are sure that the key exists
      this.outgoingPathsEdges.get(dependency).push(dependent);
    }
    if (this.incomingPathsEdges.get(dependent)?.indexOf(dependency) === -1) {
      // @ts-expect-error we are sure that the key exists
      this.incomingPathsEdges.get(dependent).push(dependency);
    }
    return true;
  }

  /**
   * Remove a dependency between two nodes.
   */
  removeDependency(dependency: string, dependent: string) {
    let idx;
    if (this.hasNode(dependency)) {
      idx = this.outgoingPathsEdges.get(dependency)!.indexOf(dependent);
      if (idx >= 0) {
        this.outgoingPathsEdges.get(dependency)!.splice(idx, 1);
      }
    }

    if (this.hasNode(dependent)) {
      idx = this.incomingPathsEdges.get(dependent)!.indexOf(dependency);
      if (idx >= 0) {
        this.incomingPathsEdges.get(dependent)!.splice(idx, 1);
      }
    }
  }

  willCauseCycle(from: string, to: string) {
    const hadFrom = this.hasNode(from);
    const hadTo = this.hasNode(to);
    this.addPath(from);
    this.addPath(to);
    this.addDependency(from, to);
    try {
      this.overallOrder();
      return false;
    } catch (e) {
      return true;
    } finally {
      this.removeDependency(from, to);
      if (!hadFrom) {
        this.removePath(from);
      }
      if (!hadTo) {
        this.removePath(to);
      }
    }
  }
  directDependentsOfEntity(entityId: string) {
    const result: string[] = [];
    for (const path of this.outgoingPathsEdges.keys()) {
      const [id] = path.split('.');
      if (entityId === id) {
        result.push(...this.outgoingPathsEdges.get(path)!);
      }
    }
  }
  directDepenciesOfEntity(entityId: string) {
    const result: string[] = [];
    for (const path of this.incomingPathsEdges.keys()) {
      const [id] = path.split('.');
      if (entityId === id) {
        result.push(...this.incomingPathsEdges.get(path)!);
      }
    }
  }
  removeEntity(entityId: string) {
    for (const path of this.paths) {
      const [id] = path.split('.');
      if (id === entityId) {
        this.removePath(path);
      }
    }
  }

  directDependentsOfPath(node: string): string[] {
    if (this.hasNode(node)) {
      return this.outgoingPathsEdges.get(node)!;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  }
  directDependenciesOfPath(node: string): string[] {
    if (this.hasNode(node)) {
      return this.incomingPathsEdges.get(node)!;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  }
  /**
   * Get an array containing the nodes that the specified node depends on (transitively).
   *
   * Throws an Error if the graph has a cycle, or the specified node does not exist.
   *
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
   * in the array.
   */
  dependenciesOfPath(node: string, leavesOnly: boolean = false): string[] {
    if (this.hasNode(node)) {
      const result: string[] = [];
      const DFS = DepGraph.createDFS(
        this.incomingPathsEdges,
        leavesOnly,
        result,
        this.circular,
      );
      DFS(node);
      const idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  }
  /**
   * get an array containing the nodes that depend on the specified node (transitively).
   *
   * Throws an Error if the graph has a cycle, or the specified node does not exist.
   *
   * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
   */
  dependantsOfPath(node: string, leavesOnly: boolean = false): string[] {
    if (this.hasNode(node)) {
      const result: string[] = [];
      const DFS = DepGraph.createDFS(
        this.outgoingPathsEdges,
        leavesOnly,
        result,
        this.circular,
      );
      DFS(node);
      const idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  }
  /**
   * Construct the overall processing order for the dependency graph.
   *
   * Throws an Error if the graph has a cycle.
   *
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
   */
  overallOrder(leavesOnly: boolean = false) {
    const result: string[] = [];
    const keys = Array.from(this.paths.keys());
    if (keys.length === 0) {
      return result;
    } else {
      if (!this.circular) {
        const CycleDFS = DepGraph.createDFS(
          this.incomingPathsEdges,
          false,
          [],
          this.circular,
        );
        keys.forEach(function (n) {
          CycleDFS(n);
        });
      }

      const DFS = DepGraph.createDFS(
        this.incomingPathsEdges,
        leavesOnly,
        result,
        this.circular,
      );

      keys
        .filter((node: string) => {
          return this.outgoingPathsEdges.get(node)!.length === 0;
        })
        .forEach((n: string) => {
          DFS(n);
        });

      if (this.circular) {
        keys
          .filter(function (node) {
            return result.indexOf(node) === -1;
          })
          .forEach(function (n) {
            DFS(n);
          });
      }

      return result;
    }
  }

  get overAllOrderLeavesOnly() {
    return this.overallOrder(true);
  }

  get overAllOrderAllNodes() {
    return this.overallOrder(false);
  }

  /**
   * Get an array of nodes that have no dependencies
   */
  get entryNodes() {
    return Array.from(this.paths.keys()).filter((node) => {
      return this.incomingPathsEdges.get(node)!.length === 0;
    });
  }
}

/**
 * Cycle error, including the path of the cycle.
 */
export class DepGraphCycleError extends Error {
  cyclePath: any[];

  constructor(cyclePath: any[]) {
    const message = 'Dependency Cycle Found: ' + cyclePath.join(' -> ');
    super(message);
    this.name = 'DepGraphCycleError';
    this.cyclePath = cyclePath;
    Object.setPrototypeOf(this, DepGraphCycleError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DepGraphCycleError);
    }
  }
}
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
  editor: EditorState;
  dependencyGraph: DepGraph;
  constructor({ editor }: { editor: EditorState }) {
    this.editor = editor;
    this.dependencyGraph = new DepGraph();
    makeObservable(this, {
      addDependency: action,
      removeRelationshipsForEntity: action,
      graph: computed,
      editor: observable,
      initAnalysis: action,
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

  get leaves() {
    return this.dependencyGraph.entryNodes;
  }
  /**
   *
   * @description overwrites for a particular toProperty inside a particular entity
   */
  addDepenciesForProperty({
    dependencies,
    toProperty,
    entityId,
    isCode,
  }: ReturnType<typeof analyzeDependancies> & {
    entityId: string;
  }) {
    const toPath = entityId + '.' + toProperty;
    // clear dependencies for the path
    this.dependencyGraph.clearIncomingEdgesForPath(toPath);
    for (const relation of dependencies) {
      this.addDependency(relation);
    }
    if (isCode) {
      this.dependencyGraph.addPath(toPath);
    }
  }

  addDependency(relationship: DependencyRelation): void {
    const { dependent, dependency } = relationship;
    const dependentProperty = dependent.path;
    const dependencyProperty = dependency.path;
    const dependentId = dependent.entityId;
    const dependencyId = dependency.entityId;
    const dependentPath = dependentId + '.' + dependentProperty;
    const dependencyPath = dependencyId + '.' + dependencyProperty;
    if (this.dependencyGraph.willCauseCycle(dependencyPath, dependentPath)) {
      throw new Error('Cycle detected');
    }
    this.dependencyGraph.addPath(dependentPath);
    this.dependencyGraph.addPath(dependencyPath);
    this.dependencyGraph.addDependency(dependencyPath, dependentPath);
  }

  getDirectDependenciesOfEntity(entityId: EntityId) {
    return this.dependencyGraph.directDepenciesOfEntity(entityId);
  }

  removeRelationshipsForEntity(entityId: EntityId) {
    this.dependencyGraph.removeEntity(entityId);
  }
  get graph() {
    return this.dependencyGraph.overAllOrderAllNodes;
  }
}
