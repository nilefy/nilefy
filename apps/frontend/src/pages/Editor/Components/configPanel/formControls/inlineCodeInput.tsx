import { Label } from '@/components/ui/label';
import { InlineCodeInputProps } from '@webloom/configpaneltypes';
import { WebloomInlineEditor } from '../../CodeEditor/inlineEditor';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InlineCodeInput = (props: InlineCodeInputProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Label>{props.label}</Label>

      <WebloomInlineEditor
        placeholder={props.placeholder}
        value={props.value || ''}
        onChange={onChange}
        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full overflow-auto rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
};

export { InlineCodeInput };
