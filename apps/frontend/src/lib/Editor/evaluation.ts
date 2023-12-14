import store from '@/store';
import { useMemo } from 'react';

export type EvaluationContext = {
  widgets: {
    [key: string]: {
      [key: string]: unknown;
    };
  };
};
export const evaluate = (code: string) => {
  if (!code) return code;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const evaluationContext = store.getState().getEvaluationContext();
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

export const useEvaluation = (
  id: string,
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const toBeEvaluatedProps = store((state) => {
    return [...(state.tree[id].toBeEvaluatedProps ?? [])];
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dependancies = store((state) => {
    return state.tree[id].dependancies;
  });
  const evaluatedProps = useMemo(
    () =>
      toBeEvaluatedProps.reduce(
        (acc, prop) => {
          const code = props[prop] as string;
          const evaluated = evaluate(code);
          acc[prop] = evaluated;
          return acc;
        },
        { ...props },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toBeEvaluatedProps, props, dependancies],
  );
  console.log('evaluatedProps', evaluatedProps);
  return evaluatedProps;
};
