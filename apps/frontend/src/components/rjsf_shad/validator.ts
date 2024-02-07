import {
  CustomValidatorOptionsType,
  Localizer,
  customizeValidator,
} from '@rjsf/validator-ajv8';
import {
  CustomValidator,
  ErrorSchema,
  ErrorTransformer,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
  ValidationData,
  ValidatorType,
} from '@rjsf/utils';
import _ from 'lodash';
import { editorStore } from '@/lib/Editor/Models';

/** `ValidatorType` implementation that is used as proxy as proxy between `@rjsf/validator-ajv8` and mobx data
 * @description: why do we need this? normally rjsf pass the data for the validator as user typed it in the form widget, but we have an additional step between the value in the form widget and the actual data we want to validate
 * we treat any code as string(any code is string after all) so any place we allow user to type code ajv will throw, so this class is proxy between what user sees in the form and what we validate
 *
 * if user typed code this proxy will get the evaluated data from mobx store and this data will be validated in ajv as usual
 * if the path being validated not code will flow in throw ajv without getting data from mobx store
 */
export class AJV8ProxyValidator<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
> implements ValidatorType<T, S, F>
{
  private ajv8: ValidatorType;

  constructor(options: CustomValidatorOptionsType, localizer?: Localizer) {
    this.ajv8 = customizeValidator(options, localizer);
  }

  /** Converts an `errorSchema` into a list of `RJSFValidationErrors`
   *
   * @param errorSchema - The `ErrorSchema` instance to convert
   * @param [fieldPath=[]] - The current field path, defaults to [] if not specified
   * @deprecated - Use the `toErrorList()` function provided by `@rjsf/utils` instead. This function will be removed in
   *        the next major release.
   */
  toErrorList(errorSchema?: ErrorSchema<T>, fieldPath: string[] = []) {
    return this.ajv8.toErrorList(errorSchema, fieldPath);
  }

  /** Runs the pure validation of the `schema` and `formData` without any of the RJSF functionality. Provided for use
   * by the playground. Returns the `errors` from the validation
   *
   * @param schema - The schema against which to validate the form data   * @param schema
   * @param formData - The form data to validate
   */
  rawValidation<Result = any>(schema: S, formData?: T) {
    return this.ajv8.rawValidation<Result>(schema, formData);
  }

  /** This function processes the `formData` with an optional user contributed `customValidate` function, which receives
   * the form data and a `errorHandler` function that will be used to add custom validation errors for each field. Also
   * supports a `transformErrors` function that will take the raw AJV validation errors, prior to custom validation and
   * transform them in what ever way it chooses.
   *
   * @param formData - The form data to validate
   * @param schema - The schema against which to validate the form data
   * @param [customValidate] - An optional function that is used to perform custom validation
   * @param [transformErrors] - An optional function that is used to transform errors after AJV validation
   * @param [uiSchema] - An optional uiSchema that is passed to `transformErrors` and `customValidate`
   */
  validateFormData(
    formData: T | undefined,
    schema: S,
    customValidate?: CustomValidator<T, S, F>,
    transformErrors?: ErrorTransformer<T, S, F>,
    uiSchema?: UiSchema<T, S, F>,
  ): ValidationData<T> {
    const propsThatCouldBeCode = this.PropertiesToArray(
      uiSchema ?? {},
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        'meta:isCode' in v &&
        v['meta:isCode'] === true,
    );
    let clonedFormData: undefined | object;
    // replace any code props to its evaluated value
    if (formData) {
      // i think rjsf provide mutable reference to the form data and if i set it directly will change the values rendered in the form
      clonedFormData = _.cloneDeep(formData);
      for (const path of propsThatCouldBeCode)
        _.set(
          clonedFormData,
          path,
          _.get(
            editorStore.evaluationManger.evaluatedForest,
            path,
            _.get(formData, path),
          ),
        );
    }
    return this.ajv8.validateFormData(
      clonedFormData ?? formData,
      schema,
      customValidate,
      transformErrors,
      uiSchema,
    );
  }
  private createPathFromStack(stack: string[]) {
    return stack.join('.');
  }

  private isObject(val: unknown): val is Record<string, unknown> {
    return _.isPlainObject(val);
  }
  /**
   * return a list of all keys in object, could choose key based on condition
   * @NOTE: the condition will only be called on types that don't match `this.isObject`
   */
  private PropertiesToArray(
    obj: Record<string, unknown>,
    condition: (value: unknown) => boolean = () => true,
  ): string[] {
    const stack: string[] = [];
    const result: string[] = [];
    // the actual function that do the recursion
    const helper = (
      obj: Record<string, unknown>,
      stack: string[],
      result: string[],
    ) => {
      for (const k in obj) {
        stack.push(k);
        const item = obj[k];
        if (condition(item)) {
          result.push(this.createPathFromStack(stack));
        }
        if (this.isObject(item)) {
          helper(item, stack, result);
        }
        stack.pop();
      }
    };
    helper(obj, stack, result);
    return result;
  }
  /** Validates data against a schema, returning true if the data is valid, or
   * false otherwise. If the schema is invalid, then this function will return
   * false.
   *
   * @param schema - The schema against which to validate the form data
   * @param formData - The form data to validate
   * @param rootSchema - The root schema used to provide $ref resolutions
   */
  isValid(schema: S, formData: T | undefined, rootSchema: S) {
    console.log('in isValid');
    console.warn('DEBUGPRINT[1]: validator.ts:97:isValid: schema=', schema);
    return this.ajv8.isValid(schema, formData, rootSchema);
  }
}

/** Creates and returns a customized implementation of the `ValidatorType` with the given customization `options` if
 * provided. If a `localizer` is provided, it is used to translate the messages generated by the underlying AJV
 * validation.
 *
 * @param [options={}] - The `CustomValidatorOptionsType` options that are used to create the `ValidatorType` instance
 * @param [localizer] - If provided, is used to localize a list of Ajv `ErrorObject`s
 * @returns - The custom validator implementation resulting from the set of parameters provided
 */
export function customcustomizeValidator<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(options: CustomValidatorOptionsType = {}, localizer?: Localizer) {
  return new AJV8ProxyValidator<T, S, F>(options, localizer);
}

export default customcustomizeValidator({
  ajvOptionsOverrides: {
    removeAdditional: true,
  },
});
