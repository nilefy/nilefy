import store from '@/store';
import { Identifier, MemberExpression, parse } from 'acorn';
import { ancestor } from 'acorn-walk';
export const analyzeDependancies = (
  code: string,
  caller: string,
  toProperty: string,
) => {
  // caller is dependant on "to" for "property"
  const dependancies = new Set<{
    on: string;
    property: string;
  }>();
  const context = store.getState().getEvaluationContext();
  const keys = Object.keys(context.widgets);
  console.log(keys);
  const keysSet = new Set(keys);
  // find every {{*}} in the code
  const matches = code.matchAll(/{{([^}]*)}}/g);
  let isCode = false;
  // for each match, find the dependancies
  for (const match of matches) {
    isCode = true;
    const expression = match[1];
    // for each expression, extract the dependancies if they exist
    const dependanciesInExpression = extractMemberExpression(expression);
    for (const dependancy of dependanciesInExpression) {
      const dependancyParts = dependancy.split('.');
      const dependancyName = dependancyParts[1];
      // if the dependancy is a widget, add it to the dependancies
      if (keysSet.has(dependancyName)) {
        dependancies.add({
          on: dependancyName,
          property: [...dependancyParts.slice(2)].join('.'),
        });
      }
    }
  }
  const dependanciesArray = Array.from(dependancies);
  store.getState().setDependancies(caller, toProperty, dependanciesArray);
  if (isCode) {
    store.getState().setToBeEvaluatedProps(caller, new Set([toProperty]));
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
