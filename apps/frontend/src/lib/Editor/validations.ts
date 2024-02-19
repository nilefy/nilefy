import Ajv, { ErrorObject } from 'ajv';
import { JsonSchema7Type, zodToJsonSchema } from 'zod-to-json-schema';
import * as Zod from 'zod';
import { memoize } from 'lodash';
import { EntityInspectorConfig } from './interface';

export const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  strict: false,
});

export const StringSchema = (defVal: string) =>
  zodToJsonSchema(Zod.string().default(defVal));
export const NumberSchema = (defVal: number) =>
  zodToJsonSchema(Zod.number().default(defVal));
export const BooleanSchema = (defVal: boolean) =>
  zodToJsonSchema(Zod.boolean().default(defVal));

export const extractValidators = memoize(
  (config: EntityInspectorConfig | undefined) => {
    if (!config) return {};
    const schemas: Record<string, JsonSchema7Type> = {};
    for (const section of config) {
      for (const control of section.children) {
        if (control.validation) {
          schemas[control.path] = control.validation;
        }
      }
    }
    const compiledValidators: Record<
      string,
      ReturnType<typeof ajv.compile>
    > = {};
    for (const key in schemas) {
      compiledValidators[key] = ajv.compile(schemas[key]);
    }
    return compiledValidators;
  },
);

export const transformErrorToMessage = (error: ErrorObject) => {
  return `${error.keyword}: ${error.message}`;
};
