import { Label } from '@/components/ui/label';
import { InlineCodeInputProps } from '@webloom/configpaneltypes';
import { useContext } from 'react';
import { FormControlContext } from '..';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { WebloomInlineEditor } from '@/pages/Editor/Components/CodeEditor/inlineEditor';

const InlineCodeInput = (props: InlineCodeInputProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Label>{props.label}</Label>
      <ScrollArea className="min-h-10 w-full overflow-auto rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <WebloomInlineEditor
          placeholder={props.placeholder}
          value={props.value || ''}
          onChange={onChange}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export { InlineCodeInput };
