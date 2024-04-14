import { WebloomCodeEditor, WebloomCodeEditorProps } from '.';
import { Omit } from 'lodash';
import { useMemo } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { inlineCodeEditorExtensionsSetup } from './extensions';

export type WebloomInlineEditorProps = Omit<WebloomCodeEditorProps, 'setup'> & {
  placeholder?: string;
};
export const WebloomInlineEditor = (props: WebloomInlineEditorProps) => {
  const inlineSetup = useMemo(
    () =>
      inlineCodeEditorExtensionsSetup({
        theme: 'light',
        placeholderText: props.placeholder,
      }),
    [props.placeholder],
  );
  return (
    <WebloomCodeEditor
      setup={inlineSetup}
      {...props}
      templateAutocompletionOnly
    />
  );
};

export const WebloonInlineInputFormControl = (
  props: WebloomInlineEditorProps,
) => {
  return (
    <div className="flex flex-col space-y-3">
      <ScrollArea className="min-h-10 border-input bg-background ring-offset-background focus-visible:ring-ring w-full overflow-auto rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <WebloomInlineEditor
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
