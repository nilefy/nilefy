import { SQLEditor } from '@/pages/Editor/Components/CodeEditor/index';
import { useCallback } from 'react';

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
import { debounce } from 'lodash';
import { EditorState } from '@/lib/Editor/Models/editor';
import { analyzeDependancies } from '@/lib/Editor/dependancyUtils';
import { editorStore } from '@/lib/Editor/Models';

const debouncedAnalyzeDependancies = debounce(
  (
    newValue: string,
    toProperty: string,
    entityId: string,
    context: EditorState['context'],
  ) => {
    const res = analyzeDependancies(newValue, toProperty, entityId, context);
    const entity = editorStore.getEntityById(entityId);
    if (entity) {
      entity.setPropIsCode(toProperty, res.isCode);
      entity.addDependencies(res.dependencies);
    }
  },
  2000,
);
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
    onChange: _onChange,
    options,
    rawErrors,
    autofocus,
    placeholder,
    formContext,
  } = props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);
  // TODO: Nagy -> modify this so that there's 1 to 1 mapping between the form and the editor
  const onChange = useCallback(
    (newValue: string) => {
      const toProp = id.split('.').slice(1).join('.');
      if (formContext && formContext.entityId && formContext.editorContext) {
        debouncedAnalyzeDependancies(
          newValue,
          toProp,
          formContext.entityId,
          formContext.editorContext,
        );
      }
      _onChange(newValue === '' ? options.emptyValue : newValue);
    },
    [_onChange, options.emptyValue, formContext, id],
  );

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
