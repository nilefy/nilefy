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
