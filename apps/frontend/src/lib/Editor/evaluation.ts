import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/actions/Editor/changeProps';
import store from '@/store';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export type EvaluationContext = {
  widgets: {
    [key: string]: {
      [key: string]: unknown;
    };
  };
};
export const evaluate = (
  code: string,
  evaluationContext: EvaluationContext,
) => {
  if (!code) return code;

  console.log('evaluationContext', evaluationContext);
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

export const useEvaluation = (id: string): Record<string, unknown> => {
  const props = store(useShallow((state) => state.getProps(id)));
  return props;
};
