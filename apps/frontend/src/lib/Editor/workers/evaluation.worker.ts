import toposort from 'toposort';
import { get, set } from 'lodash';
import { DependencyMap } from '../Models/dependencyManager';
import { evaluate } from '../evaluation';
type Path = string;
type DependentPath = Path;
type DependencyPath = Path;
self.addEventListener('message', (event) => {
  const { data } = event;
  const { code, body } = data;
  const data1 = evalForest(
    body.dependencies,
    body.unevalNodes,
    body.codeRawValues,
  );
  self.postMessage(data1);
});

function getDirectDependencies(dependencies: DependencyMap, entityId: string) {
  return dependencies.get(entityId) || null;
}
const transformToGraph = (dependencies: DependencyMap) => {
  const graph: [DependentPath, DependencyPath][] = [];
  for (const [dependent, dependencyMap] of dependencies.entries()) {
    for (const [dependency, dependentMap] of dependencyMap.entries()) {
      for (const [dependentPath, dependencyPathSet] of dependentMap.entries()) {
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
};

const evalForest = (
  dependencyMap: DependencyMap,
  unevalNodes: Record<string, unknown>,
  codeRawValues: Set<string>,
) => {
  const graph = transformToGraph(dependencyMap);
  const sortedGraph = toposort(graph).reverse();
  const evalTree: Record<string, unknown> = {};
  const evaluatedInGraph = new Set<string>();
  for (const fullPath of sortedGraph) {
    const [entityId] = fullPath.split('.');
    evaluatedInGraph.add(fullPath);
    if (
      getDirectDependencies(dependencyMap, entityId) &&
      !codeRawValues.has(fullPath)
    ) {
      set(evalTree, fullPath, get(unevalNodes, fullPath));
      continue;
    }
    const gottenValue = get(unevalNodes, fullPath);

    set(evalTree, fullPath, evaluate((gottenValue || '') as string, evalTree));
  }
  // will hit this loop with code without deps
  // example: {{[{name: "dsa"}]}}
  for (const fullPath of codeRawValues) {
    if (evaluatedInGraph.has(fullPath)) continue;
    const gottenValue = get(unevalNodes, fullPath);
    set(evalTree, fullPath, evaluate((gottenValue || '') as string, evalTree));
  }
  return evalTree;
};
