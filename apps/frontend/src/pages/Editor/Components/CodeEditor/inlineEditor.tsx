import { WebloomCodeEditor, WebloomCodeEditorProps } from '.';
import { Omit } from 'lodash';
import { useMemo } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { inlineCodeEditorExtensionsSetup } from './extensions';
import { useTheme } from '@/components/theme-provider';

export type WebloomInlineEditorProps = Omit<WebloomCodeEditorProps, 'setup'> & {
  placeholder?: string;
  fileName: string;
  isEvent?: boolean;
};
export const WebloomInlineEditor = (props: WebloomInlineEditorProps) => {
  const { placeholder, fileName, isEvent, ...rest } = props;
  const theme = useTheme().activeTheme;
  const inlineSetup = useMemo(
    () =>
      inlineCodeEditorExtensionsSetup({
        theme,
        placeholderText: placeholder,
        fileName: fileName,
        isEvent,
      }),
    [fileName, placeholder, isEvent, theme],
  );
  return (
    <WebloomCodeEditor
      setup={inlineSetup}
      {...rest}
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
          id={props.id}
          fileName={props.fileName}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
