import { SQLEditor } from '@/pages/Editor/Components/CodeEditor/index';

import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  labelValue,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { Label } from '../ui/label';

export default function SQLRJSFWidget<
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
    onChange,
    options,
    rawErrors,
    autofocus,
    placeholder,
  } = props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);

  return (
    <div id={`${id}-label`}>
      {labelValue(<Label htmlFor={id}>{label}</Label>, hideLabel || !label)}
      <SQLEditor
        aria-invalid={rawErrors && rawErrors.length > 0}
        id={id}
        value={
          value === undefined
            ? ''
            : typeof value === 'string'
            ? value
            : `{{${JSON.stringify(value)}}}`
        }
        onChange={onChange}
        autoFocus={autofocus}
        placeholder={placeholder}
        {...inputProps}
        aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
      />
    </div>
  );
}
