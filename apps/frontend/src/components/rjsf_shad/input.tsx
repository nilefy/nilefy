import { ChangeEvent, FocusEvent } from 'react';
import { Input } from '../ui/input';

import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  examplesId,
  labelValue,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { Label } from '../ui/label';
import { FormItem } from '../ui/form';
import { Lock } from 'lucide-react';

/** The `BaseInputTemplate` is the template to use to render the basic `<input>` component for the `core` theme.
 * It is used as the template for rendering many of the <input> based widgets that differ by `type` and callbacks only.
 * It can be customized/overridden for other themes or individual implementations as needed.
 *
 * @param props - The `WidgetProps` for this template
 */ export default function BaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: BaseInputTemplateProps<T, S, F>) {
  const {
    id,
    type,
    value,
    label,
    hideLabel,
    schema,
    uiSchema,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    options,
    required,
    readonly,
    rawErrors,
    autofocus,
    placeholder,
    disabled,
  } = props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);
  const isEncryptedField =
    uiSchema?.['ui:encrypted'] !== undefined &&
    typeof uiSchema['ui:encrypted'] === 'string'
      ? true
      : false;
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, value);

  return (
    <FormItem id={`${id}-label`}>
      <div className="flex items-center justify-between">
        {labelValue(<Label htmlFor={id}>{label}</Label>, hideLabel || !label)}
        {isEncryptedField ? (
          <span className="flex gap-4 text-green-500">
            <Lock /> Encrypted
          </span>
        ) : null}
      </div>
      <Input
        disabled={disabled || readonly}
        required={required}
        readOnly={readonly}
        aria-invalid={rawErrors && rawErrors.length > 0}
        id={id}
        name={id}
        value={value || value === 0 ? value : ''}
        onChange={onChangeOverride || _onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        autoFocus={autofocus}
        placeholder={placeholder}
        {...inputProps}
        list={schema.examples ? examplesId<T>(id) : undefined}
        aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
      />
      {Array.isArray(schema.examples) ? (
        <datalist id={examplesId<T>(id)}>
          {(schema.examples as string[])
            .concat(
              schema.default && !schema.examples.includes(schema.default)
                ? ([schema.default] as string[])
                : [],
            )
            .map((example) => {
              return <option key={example} value={example} />;
            })}
        </datalist>
      ) : null}
      {isEncryptedField ? (
        <span className="text-muted-foreground ml-2">
          this field will not be stroed as normal text in our database
        </span>
      ) : null}
    </FormItem>
  );
}
