import { osName } from 'react-device-detect';
import { isPlainObject } from 'lodash';

export const isMacOs = () => {
  return osName === 'Mac OS';
};

export const bindingRegexGlobal = /{{([\s\S]*?)}}/g;

// stable hash function
export function hashKey(item: unknown): string {
  return JSON.stringify(item, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
          }, {} as any)
      : val,
  );
}

export const singularOrPlural = (
  num: number,
  singular: string,
  plural: string,
) => {
  return num === 1 ? singular : plural;
};
