import { Label } from '@/components/ui/label';
import { InlineCodeInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { FormControlContext } from '..';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { WebloomInlineEditor } from '@/pages/Editor/Components/CodeEditor/inlineEditor';

const InlineCodeInput = (props: InlineCodeInputProps) => {
  const { onChange } = useContext(FormControlContext);

  // TODO: we convert non string value to js template, until the validation code could handle this case
  const correctValue =
    typeof props.value === 'string'
      ? props.value
      : `{{${JSON.stringify(props.value ?? '')}}}`;

  return (
    <div className="flex flex-col space-y-3">
      <Label>{props.label}</Label>
      <ScrollArea className="min-h-10 border-input bg-background ring-offset-background focus-visible:ring-ring w-full overflow-auto rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <WebloomInlineEditor
          placeholder={props.placeholder}
          value={correctValue}
          onChange={onChange}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default InlineCodeInput;
