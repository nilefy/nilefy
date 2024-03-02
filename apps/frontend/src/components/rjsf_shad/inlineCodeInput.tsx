import { Label } from '@/components/ui/label';
import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  labelValue,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { WebloomInlineEditor } from '@/pages/Editor/Components/CodeEditor/inlineEditor';

export default function InlineCodeInputWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: BaseInputTemplateProps<T, S, F>) {
  const { id, type, label, hideLabel, schema, onChange, options, autofocus } =
    props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);
  // TODO: we convert non string value to js template, until the validation code could handle this case
  const correctValue =
    typeof props.value === 'string'
      ? props.value
      : `{{${JSON.stringify(props.value ?? '', null, 2)}}}`;

  return (
    <div id={`${id}-label`} className="flex flex-col space-y-3">
      {labelValue(<Label htmlFor={id}>{label}</Label>, hideLabel || !label)}
      <ScrollArea className="min-h-10 w-full overflow-auto rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <WebloomInlineEditor
          id={id}
          placeholder={props.placeholder}
          value={correctValue}
          onChange={onChange}
          autoFocus={autofocus}
          aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
          {...inputProps}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
