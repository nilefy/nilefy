import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FocusEvent } from 'react';
import {
  ariaDescribedByIds,
  enumOptionsIndexForValue,
  enumOptionsValueForIndex,
  labelValue,
  optionId,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';

/** The `RadioWidget` is a widget for rendering a radio group.
 *  It is typically used with a string property constrained with enum options.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function RadioWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  options,
  value,
  disabled,
  readonly,
  label,
  hideLabel,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, emptyValue } = options;

  const _onChange = (value: string) =>
    onChange(enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));

  const selectedIndex = enumOptionsIndexForValue<S>(value, enumOptions) ?? null;

  return (
    <>
      {labelValue(<Label htmlFor={id}>{label || undefined}</Label>, hideLabel)}
      <RadioGroup
        id={id}
        name={id}
        value={selectedIndex as string | undefined}
        onValueChange={_onChange}
        aria-describedby={ariaDescribedByIds<T>(id)}
      >
        {Array.isArray(enumOptions) &&
          enumOptions.map((option, index) => {
            const itemDisabled =
              Array.isArray(enumDisabled) &&
              enumDisabled.indexOf(option.value) !== -1;
            const radio = (
              <div
                className="flex items-center space-x-2"
                key={optionId(id, index)}
              >
                <RadioGroupItem
                  value={String(index)}
                  key={index}
                  disabled={disabled || itemDisabled || readonly}
                  id={optionId(id, index)}
                />
                <Label htmlFor={optionId(id, index)}>{option.label}</Label>
              </div>
            );
            return radio;
          })}
      </RadioGroup>
    </>
  );
}
