import { memoize } from 'lodash';
import { bindingRegexGlobal } from '../utils';
import { EntityInspectorConfig } from './interface';

export type EvaluationContext = Record<string, unknown>;

export const evaluate = (
  code: string,
  evaluationContext: Record<string, unknown>,
): {
  value: unknown;
  errors: string[] | null;
} => {
  if (!code)
    return {
      value: code,
      errors: null,
    };
  // does this branch ever get hit?
  if (!code.includes('{{')) return { value: code, errors: null };
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
  const errors: string[] = [];
  const evalInContext = (expression: string) => {
    try {
      return new Function('context', `with(context) { return ${expression} }`)(
        evaluationContext,
      );
    } catch (e: unknown) {
      const error = e as Error;
      errors.push(error.name + ': ' + error.message);
      return undefined;
    }
  };
  const evaluatedExpressions = expressions.map((expression) => {
    try {
      return evalInContext(expression);
    } catch (e) {
      return undefined;
    }
  });

  if (evaluatedExpressions.length === 1 && firstMatchLength === code.length) {
    return {
      value: evaluatedExpressions[0],
      errors: errors.length ? errors : null,
    };
  }
  const final = code.replace(bindingRegexGlobal, (_, p1) => {
    const index = expressions.indexOf(p1);
    return evaluatedExpressions[index];
  });
  return {
    value: final,
    errors: errors.length ? errors : null,
  };
};

const evaluationFormControls = new Set(['sql', 'inlineCodeInput']);

export const getEvaluablePathsFromInspectorConfig = memoize(
  (config: EntityInspectorConfig | undefined, nestedPathPrefix?: string) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (evaluationFormControls.has(control.type)) {
          let path = control.path;
          if (nestedPathPrefix) {
            path = nestedPathPrefix + '.' + path;
          }
          paths.push(path);
        }
      }
    }
    return paths;
  },
);
