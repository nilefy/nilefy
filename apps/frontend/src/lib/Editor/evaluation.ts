import { memoize } from 'lodash';
import { bindingRegexGlobal } from '../utils';
import { EntityInspectorConfig } from './interface';

export type EvaluationContext = Record<string, unknown>;

export const evaluate = (
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

const evaluationFormControls = new Set(['sql', 'inlineCodeInput']);

export const getEvaluablePathsFromInspectorConfig = memoize(
  (config: EntityInspectorConfig | undefined, nestedPathPrefix?: string) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (evaluationFormControls.has(control.type)) {
          let path = control.key;
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
