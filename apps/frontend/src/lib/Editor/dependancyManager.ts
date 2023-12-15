import store from '@/store';

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
  console.log('context', context);
  const keys = Object.keys(context.widgets);
  // find every {{*}} in the code
  const matches = code.matchAll(/{{([^}]*)}}/g);
  let isCode = false;
  // for each match, find the dependancies
  for (const match of matches) {
    isCode = true;
    const expression = match[1];
    // for each expression, extract the dependancies if they exist
    for (const key of keys) {
      if (expression.includes(key)) {
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
