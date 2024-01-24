export type EvaluationContext = {
  widgets: Record<string, Record<string, unknown>>;
  queries: Record<string, unknown>;
};

export const evaluate = (
  code: string,
  evaluationContext: EvaluationContext,
) => {
  if (!code) return code;

  if (!code.includes('{{')) return code;
  const matches = code.matchAll(/{{([^}]*)}}/g);

  const expressions: string[] = [];
  for (const match of matches) {
    const expression = match[1];
    expressions.push(expression);
  }
  const evalInContext = (expression: string) => {
    try {
      return new Function('context', `with(context) { return ${expression} }`)(
        evaluationContext,
      );
    } catch (e) {
      return undefined;
    }
  };
  const evaluatedExpressions = expressions
    .map((expression) => {
      try {
        return evalInContext(expression);
      } catch (e) {
        return undefined;
      }
    })
    .filter((e) => e !== undefined);
  const final = code.replace(/{{([^}]*)}}/g, (_, p1) => {
    const index = expressions.indexOf(p1);
    return evaluatedExpressions[index];
  });
  return final;
};
