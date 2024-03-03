import { FormEvent, FocusEvent } from 'react';
import { Checkbox } from '../ui/checkbox';
import {
  ariaDescribedByIds,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsValueForIndex,
  labelValue,
  optionId,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { Label } from '../ui/label';

/** The `CheckboxesWidget` is a widget for rendering checkbox groups.
 *  It is typically used to represent an array of enums.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CheckboxesWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  label,
  hideLabel,
  id,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
  rawErrors = [],
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, emptyValue } = options;
  const checkboxesValues = Array.isArray(value) ? value : [value];

  const _onChange = (index: number) => (checked: boolean) => {
    if (checked) {
      onChange(enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions));
    } else {
      onChange(
        enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions),
      );
    }
  };

  const _onBlur = ({ target: { value } }: FocusEvent<HTMLButtonElement>) =>
    onBlur(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));

  const _onFocus = ({ target: { value } }: FocusEvent<HTMLButtonElement>) =>
    onFocus(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));

  return (
    <div className="my-4 flex flex-col gap-4">
      {labelValue(<Label htmlFor={id}>{label || undefined}</Label>, hideLabel)}
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index: number) => {
          const checked = enumOptionsIsSelected<S>(
            option.value,
            checkboxesValues,
          );
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          return (
            <div className="flex gap-2" key={optionId(id, index)}>
              <Checkbox
                id={optionId(id, index)}
                name={id}
                checked={checked}
                disabled={disabled || itemDisabled || readonly}
                autoFocus={autofocus && index === 0}
                onFocus={_onFocus}
                onBlur={_onBlur}
                onCheckedChange={_onChange(index)}
                key={index}
                {...(options.props as object)}
                aria-describedby={ariaDescribedByIds<T>(id)}
              />
              <Label htmlFor={optionId(id, index)}>{option.label}</Label>
            </div>
          );
        })}
    </div>
  );
}
