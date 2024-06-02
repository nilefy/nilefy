import { memoize, toPath } from 'lodash';
import { EntityInspectorConfig } from '../interface';
import {
  bindingRegexGlobal,
  functionActionWrapper,
  functionExpressionWrapper,
  sanitizeScript,
} from './utils';
const AsyncFunction = async function () {}.constructor;
export const evaluate = (
  code: string,
  evaluationContext: Record<string, unknown>,
  isAction: boolean = false,
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
    expression = sanitizeScript(expression);
    try {
      if (isAction) {
        return new Function(
          'context',
          `with(context) { ${functionActionWrapper(expression)} }`,
        )(evaluationContext);
      }
      return new Function(
        'context',
        `with(context) { return (${functionExpressionWrapper(expression)}) }`,
      )(evaluationContext);
    } catch (e: unknown) {
      let error: Error;
      if (e instanceof Error) {
        error = e;
      } else {
        error = new Error('Unknown error');
      }
      errors.push(error.name + ': ' + error.message);
      return null;
    }
  };
  const evaluatedExpressions = expressions.map((expression) => {
    try {
      return evalInContext(expression);
    } catch (e) {
      return null;
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
export const evaluateAsync = async (
  code: string,
  evaluationContext: Record<string, unknown>,
): Promise<{
  value: unknown;
  errors: string[] | null;
}> => {
  code = sanitizeScript(code);
  try {
    return {
      // @ts-expect-error no types
      value: await new AsyncFunction(
        'context',
        `with(context) { return await (${functionActionWrapper(code)}) }`,
      )(evaluationContext),
      errors: null,
    };
  } catch (e: unknown) {
    let error: Error;
    if (e instanceof Error) {
      error = e;
    } else {
      error = new Error('Unknown error');
    }
    return {
      value: null,
      errors: [error.name + ': ' + error.message],
    };
  }
};
const evaluationFormControls = new Set(['sql', 'inlineCodeInput', 'codeInput']);

export const getEvaluablePathsFromInspectorConfig = memoize(
  (config: EntityInspectorConfig | undefined) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (control.type === 'array') {
          for (const subControl of control.options.subform) {
            // TODO: handle nested arrays but it's a bit of an overkill
            if (evaluationFormControls.has(subControl.type)) {
              const path = `${control.path}[*].${subControl.path}`;
              paths.push(path);
            }
          }
        } else if (control.type === 'keyValue') {
          paths.push(...[`${control.path}[*].value`, `${control.path}[*].key`]);
        } else if (evaluationFormControls.has(control.type)) {
          const path = control.path;
          paths.push(path);
        }
      }
    }
    return paths;
  },
);
export const getEventPathsFromInspectorConfig = memoize(
  (config: EntityInspectorConfig | undefined) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (!control.isEvent) continue;
        paths.push(control.path);
      }
    }
    return paths;
  },
);

export const getShouldntCheckForBinding = memoize(
  (config: EntityInspectorConfig | undefined) => {
    if (!config) return [];
    const paths: string[] = [];
    for (const section of config) {
      for (const control of section.children) {
        if (control.isCode) {
          paths.push(control.path);
        }
      }
    }
    return paths;
  },
);
export const evaluablePathsHasPath = (
  path: string,
  evaluablePaths: Set<string>,
) => {
  if (evaluablePaths.has(path)) return true;
  const genericPath = getGenericArrayPath(path);
  if (evaluablePaths.has(genericPath)) return true;
  return false;
};
const digitRegex = /\d+/;

export const getGenericArrayPath = (path: string) => {
  const pathParts = toPath(path);
  let newPath = '';
  for (let i = 0; i < pathParts.length; i++) {
    if (digitRegex.test(pathParts[i])) {
      newPath += '[*]';
    } else {
      if (i === 0) {
        newPath += pathParts[i];
      } else newPath += '.' + pathParts[i];
    }
  }
  return newPath;
};
