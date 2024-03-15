import {
  ariaDescribedByIds,
  EnumOptionsType,
  enumOptionsIndexForValue,
  enumOptionsValueForIndex,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
  labelValue,
} from '@rjsf/utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '../ui/label';
import { FormItem } from '../ui/form';

export default function SelectWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    options,
    label,
    hideLabel,
    placeholder,
    required,
    disabled,
    readonly,
    value,
    autofocus,
    onChange,
  } = props;
  const { enumOptions, enumDisabled, emptyValue } = options;

  const _onChange = (value: string) => {
    return onChange(
      enumOptionsValueForIndex<S>(value, enumOptions, emptyValue),
    );
  };

  const _valueLabelMap: any = {};
  const displayEnumOptions = Array.isArray(enumOptions)
    ? enumOptions.map((option: EnumOptionsType<S>, index: number) => {
        const { value, label } = option;
        _valueLabelMap[index] = label || String(value);
        return {
          label,
          value: String(index),
          isDisabled:
            Array.isArray(enumDisabled) && enumDisabled.indexOf(value) !== -1,
        };
      })
    : [];

  const selectedIndex = enumOptionsIndexForValue<S>(value, enumOptions);
  const formValue = {
    label: _valueLabelMap[selectedIndex as string] || '',
    selectedIndex,
  };

  return (
    <FormItem>
      {labelValue(
        <Label htmlFor={id} id={`${id}-label`}>
          {label}
        </Label>,
        hideLabel || !label,
      )}
      <Select
        disabled={disabled || readonly}
        required={required}
        name={id}
        aria-describedby={ariaDescribedByIds<T>(id)}
        onValueChange={_onChange}
        defaultValue={String(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            id={id}
            autoFocus={autofocus}
            placeholder={placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {displayEnumOptions.map(({ label, value, isDisabled }, i) => {
            return (
              <SelectItem
                key={`${i}+${id}`}
                value={value}
                disabled={isDisabled}
              >
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </FormItem>
  );
}
