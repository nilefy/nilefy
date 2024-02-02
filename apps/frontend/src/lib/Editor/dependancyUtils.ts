import { Identifier, MemberExpression, parse } from 'acorn';
import { ancestor } from 'acorn-walk';
import toposort from 'toposort';
import { EvaluationContext } from './evaluation';
import { DependencyRelation } from './Models/dependencyManager';
import { has } from 'lodash';

export const analyzeDependancies = (
  code: unknown,
  toProperty: string,
  entityId: string,
  keys: EvaluationContext,
) => {
  if (typeof code !== 'string') return { dependencies: [], isCode: false };
  const keysSet = new Set(Object.keys(keys));
  const dependencies: Array<DependencyRelation> = [];
  const matches = code.matchAll(/{{([^}]*)}}/g);
  let isCode = false;
  for (const match of matches) {
    isCode = true;
    const expression = match[1];
    try {
      const dependanciesInExpression = extractMemberExpression(expression);
      for (const dependancy of dependanciesInExpression) {
        const dependancyParts = dependancy.split('.');
        const dependancyName = dependancyParts[0];
        const path = dependancyParts.slice(1).join('.');
        if (keysSet.has(dependancyName) && has(keys[dependancyName], path)) {
          dependencies.push({
            dependent: {
              entityId,
              path: toProperty,
            },
            dependency: {
              entityId: dependancyName,
              path,
            },
          });
        }
      }
    } catch (_) {
      //todo handle field validation
    }
  }
  return { dependencies, isCode };
};

/**
 *
 * @param code "a.b.c + a.b.d ...etc"
 * @returns ["a.b.c", "a.b.d"]
 */
function extractMemberExpression(code: string) {
  const memberExpressions = new Set<string>();
  const ast = parse(code, { ecmaVersion: 2020 });
  ancestor(ast, {
    Identifier(node, _, ancestors) {
      let name = node.name;
      for (let i = ancestors.length - 2; i >= 0; i--) {
        const ancestor = ancestors[i];
        if (ancestor.type === 'MemberExpression') {
          const memberExpression = ancestor as MemberExpression;
          if (memberExpression.property.type === 'Identifier') {
            const Identifier = memberExpression.property as Identifier;
            name += '.' + Identifier.name;
          }
        } else break;
      }
      memberExpressions.add(name);
    },
  });
  return memberExpressions;
}
export type CycleResult =
  | {
      hasCycle: true;
      cycle: Array<string>;
    }
  | {
      hasCycle: false;
    };

export function hasCyclicDependencies(
  graph: Array<[string, string]>,
): CycleResult {
  try {
    toposort(graph);
    return { hasCycle: false };
  } catch (e) {
    return { hasCycle: true, cycle: e.message };
  }
}
