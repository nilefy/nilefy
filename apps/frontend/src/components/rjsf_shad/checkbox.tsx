import { ChangeEvent, FocusEvent } from 'react';
import { Checkbox } from '../ui/checkbox';
import {
  ariaDescribedByIds,
  descriptionId,
  getTemplate,
  labelValue,
  WidgetProps,
  schemaRequiresTrueValue,
  StrictRJSFSchema,
  RJSFSchema,
  FormContextType,
} from '@rjsf/utils';
import { FormItem } from '../ui/form';
import { Label } from '../ui/label';

export default function CheckboxWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
    label,
    hideLabel,
    registry,
    options,
    uiSchema,
    schema,
  } = props;
  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema);
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    S,
    F
  >('DescriptionFieldTemplate', registry, options);
  const description = options.description || schema.description;

  const _onChange = (checked: boolean) => onChange(checked);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement | any>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: FocusEvent<HTMLInputElement | any>) => onFocus(id, value);

  return (
    <FormItem>
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <Checkbox
        required={required}
        id={id}
        name={id}
        checked={typeof value === 'undefined' ? false : value}
        disabled={disabled || readonly}
        onCheckedChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        aria-describedby={ariaDescribedByIds<T>(id)}
      >
        {labelValue(<Label>{label}</Label>, hideLabel || !label)}
      </Checkbox>
    </FormItem>
  );
}
