import { bindingRegexGlobal } from '../utils';

export type EvaluationContext = Record<string, unknown>;

export const evaluateExpressions = (
  code: string,
  evaluationContext: Record<string, unknown>,
) => {
  if (!code) return code;

  if (!code.includes('{{')) return code;
  const matches = code.matchAll(bindingRegexGlobal);
  const expressions: string[] = [];
  let firstMatchLength = 0;
  for (const match of matches) {
    const expression = match[1];
    if (firstMatchLength === 0) {
      firstMatchLength = expression.length + 4;
    }
    expressions.push(expression);
  }
  const evaluatedExpressions = expressions
    .map((expression) => {
      try {
        return evalInContext(expression, evaluationContext);
      } catch (e) {
        // TODO: use errors to close https://github.com/z-grad-pr-sh/frontend/issues/250
        return undefined;
      }
    })
    .filter((e) => e !== undefined);
  // TODO: This is temporary fix until we implement type validation
  if (evaluatedExpressions.length === 1 && firstMatchLength === code.length) {
    return evaluatedExpressions[0];
  }
  const final = code.replace(bindingRegexGlobal, (_, p1) => {
    const index = expressions.indexOf(p1);
    return evaluatedExpressions[index];
  });
  return final;
};

function evalInContext(
  expression: string,
  evaluationContext: Record<string, unknown>,
) {
  try {
    return new Function('context', `with(context) { return ${expression} }`)(
      evaluationContext,
    );
  } catch (e) {
    console.error('DEBUGPRINT[4]: evaluation.ts:51: e=', e);
    // TODO: use errors to close https://github.com/z-grad-pr-sh/frontend/issues/250
    return undefined;
  }
}

export function evaluateCode(
  code: string,
  evaluationContext: Record<string, unknown>,
) {
  if (!code) return code;

  try {
    return new Function('context', `with(context) { ${code} }`)(
      evaluationContext,
    );
  } catch (e) {
    console.error('DEBUGPRINT[4]: evaluation.ts:51: e=', e);
    // TODO: use errors to close https://github.com/z-grad-pr-sh/frontend/issues/250
    return undefined;
  }
}
