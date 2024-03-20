//@ts-expect-error no types
import { get } from 'lodash';
import unescapeJS from 'unescape-js';
export const functionActionWrapper = (code: string) => {
  return `
      (function() {
         ${code}
      })()
    `;
};
export const functionExpressionWrapper = (code: string) => {
  return `
      (function() {
         return ${code}
      })()
    `;
};
const beginsWithLineBreakRegex = /^\s+|\s+$/;

export function sanitizeScript(js: string) {
  // We remove any line breaks from the beginning of the script because that
  // makes the final function invalid. We also unescape any escaped characters
  // so that eval can happen
  const trimmedJS = js.replace(beginsWithLineBreakRegex, '');
  return unescapeJS(trimmedJS);
}

export const bindingRegexGlobal = /{{([\s\S]*?)}}/g;
/**
 * @description this method returns all the paths that are affected by the path
 * @todo currently works for one level deep
 * @param path ```ts
 * "path1[*].path2.path3[*].path4"
 * ```
 * @returns ```ts
 * ["path1[0].path2.path3[0].path4", "path1[0].path2.path3[1].path4", "path1[0].path2.path3[2].path4"]
 * ```
 */

export const getArrayPaths = (
  path: string,
  evaluablePaths: Set<string>,
  values: Record<string, unknown>,
): string[] => {
  const paths: string[] = [];
  if (!evaluablePaths.has(path)) return [];
  const [array, ...rest] = path.split('[*]');
  const arrayValue = get(values, array);
  if (Array.isArray(arrayValue)) {
    for (let i = 0; i < arrayValue.length; i++) {
      paths.push(`${array}[${i}]${rest.join('')}`);
    }
  }
  return paths;
};
