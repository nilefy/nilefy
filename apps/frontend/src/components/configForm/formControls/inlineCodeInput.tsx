import { Label } from '@/components/ui/label';
import { InlineCodeInputProps } from '@/lib/Editor/interface';
import { useCallback, useContext } from 'react';
import { FormControlContext } from '..';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { WebloomInlineEditor } from '@/pages/Editor/Components/CodeEditor/inlineEditor';
import { analyzeDependancies } from '@/lib/Editor/dependancyUtils';
import { editorStore } from '@/lib/Editor/Models';
import { debounce } from 'lodash';
import { WebloomPage } from '@/lib/Editor/Models/page';

const debouncedAnalyzeDependancies = debounce(
  (
    newValue: string,
    toProperty: string,
    id: string,
    context: WebloomPage['context'],
  ) => {
    const res = analyzeDependancies(newValue, toProperty, id, context);
    const widget = editorStore.currentPage.getWidgetById(id);
    widget.setPropIsCode(toProperty, true);
    widget.addDependencies(res.dependencies);
  },
  2000,
);
const InlineCodeInput = (props: InlineCodeInputProps) => {
  const {
    onChange: _onChange,
    id,
    toProperty,
  } = useContext(FormControlContext);
  const onChange = useCallback(
    (newValue: string) => {
      if (id && toProperty) {
        debouncedAnalyzeDependancies(
          newValue,
          toProperty,
          id,
          editorStore.currentPage.context,
        );
      }
      if (toProperty === 'options') {
        _onChange(JSON.parse(newValue));
      } else {
        _onChange(newValue);
      }
    },
    [_onChange, id, toProperty],
  );
  return (
    <div className="flex flex-col space-y-3">
      <Label>{props.label}</Label>
      <ScrollArea className="min-h-10 border-input bg-background ring-offset-background focus-visible:ring-ring w-full overflow-auto rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <WebloomInlineEditor
          placeholder={props.placeholder}
          value={
            toProperty === 'options'
              ? JSON.stringify(props.value, null, 3)
              : props.value || ''
          }
          onChange={onChange}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default InlineCodeInput;
