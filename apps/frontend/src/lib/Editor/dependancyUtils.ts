import { Identifier, MemberExpression, parse } from 'acorn';
import { ancestor } from 'acorn-walk';
import { EvaluationContext } from './evaluation';
import { editorStore } from './Models';
import { DependencyRelation } from './Models/widget';
export const analyzeDependancies = (
  code: string,
  callerId: string,
  toProperty: string,
  keys: EvaluationContext,
) => {
  const keysSet = new Set(Object.keys(keys.widgets));
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
        const dependancyName = dependancyParts[1];
        if (keysSet.has(dependancyName)) {
          dependencies.push({
            to: toProperty,
            on: {
              entityId: dependancyName,
              props: [...dependancyParts.slice(2)],
            },
          });
        }
      }
    } catch (_) {
      //todo handle field validation
    }
  }
  const caller = editorStore.currentPage.getWidgetById(callerId);
  caller.setIsPropCode(toProperty, isCode);
  if (dependencies.length > 0) {
    caller.addDependencies(dependencies);
  }
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
