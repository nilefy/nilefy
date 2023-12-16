import store from '@/store';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';
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
  // find every {{*}} in the code
  const matches = code.matchAll(/{{([^}]*)}}/g);
  let isCode = false;
  // for each match, find the dependancies
  for (const match of matches) {
    isCode = true;
    const expression = match[1];
    // for each expression, extract the dependancies if they exist
    const dependanciesInExpression = extractMemberExpression(expression);
    console.log('dependanciesInExpression', dependanciesInExpression);
    for (const key of keys) {
      if (expression.includes(key)) {
        // this won't cut it for expressions like {{widgets.a.b + widgets.c.d ... }}
        const property = expression.split('.').slice(2).join('.');
        dependancies.add({
          on: key,
          property,
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
// function extractMemberExpression(code: string) {
//   const memberExpressions: string[] = [];
//   const ast = parse(code, { ecmaVersion: 2020 });
//   simple(ast, {
//     MemberExpression(node) {
//       let expression = '';
//       let object = node;
//       while (object.type === 'MemberExpression') {
//         expression = '.' + object.property.name + expression;
//         object = object.object;
//       }
//       expression = object.name + expression;
//       memberExpressions.push(expression);
//     },
//   });
// }

/**
 *
 * @param code "a.b.c + a.b.d ...etc"
 * @returns ["a.b.c", "a.b.d"]
 */
function extractMemberExpression(code: string) {
  //todo fix this
  const memberExpressions: string[] = [];
  const ast = parse(code, { ecmaVersion: 2020 });
  simple(ast, {
    MemberExpression(node) {
      const names = [];
      let object = node;
      while (object.type === 'MemberExpression') {
        // @ts-expect-error deal with acorn types later
        names.push(object.property.name);
        object = object.object;
      }
      names.push(object.name);
      memberExpressions.push(names.reverse().join('.'));
    },
  });
  console.log(memberExpressions);
  return memberExpressions;
}
