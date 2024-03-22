import {
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  bracketMatching,
  defaultHighlightStyle,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  crosshairCursor,
  dropCursor,
  highlightSpecialChars,
  keymap,
  placeholder,
  rectangularSelection,
} from '@codemirror/view';
import {
  WebloomCodeEditor,
  WebloomCodeEditorProps,
  inlineTheme,
  jsTemplatePlugin,
} from '.';
import { Omit } from 'lodash';
import { useMemo } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const inlineSetupCallback = (
  placeholderText: string = 'Enter something',
) => [
  highlightSpecialChars(),
  history(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  placeholder(placeholderText),
  inlineTheme,
  highlightSelectionMatches(),
  jsTemplatePlugin,
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

export type WebloomInlineEditorProps = Omit<WebloomCodeEditorProps, 'setup'> & {
  placeholder?: string;
};
export const WebloomInlineEditor = (props: WebloomInlineEditorProps) => {
  const inlineSetup = useMemo(
    () => inlineSetupCallback(props.placeholder),
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
