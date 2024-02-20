import { Identifier, MemberExpression, parse } from 'acorn';
import { ancestor } from 'acorn-walk';
import { bindingRegexGlobal } from '../utils';
export type DependencyRelation = {
  // from is the dependent
  dependent: { entityId: string; path: string };
  // to is the dependency
  dependency: { entityId: string; path: string };
};
export type AnalysisContext = Record<string, Set<string>>;
export const analyzeDependancies = ({
  code,
  toProperty,
  entityId,
  keys,
}: {
  code: unknown;
  toProperty: string;
  entityId: string;
  keys: AnalysisContext;
}) => {
  if (typeof code !== 'string')
    return { toProperty, dependencies: [], isCode: false };
  const entityNames = new Set(Object.keys(keys));

  const dependencies: Array<DependencyRelation> = [];
  const matches = code.matchAll(bindingRegexGlobal);
  const errors: unknown[] = [];
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

        if (entityNames.has(dependancyName) && keys[dependancyName].has(path)) {
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
    } catch (e: unknown) {
      errors.push(e);
    }
  }
  // console.log('errors in analysis', errors);
  // todo return errors and do something with them
  return { toProperty, dependencies, isCode };
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
