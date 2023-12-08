import {
  autocompletion,
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
import { EditorState, Extension } from '@codemirror/state';
import {
  EditorView,
  crosshairCursor,
  dropCursor,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from '@codemirror/view';
import { WebloomCodeEditor, WebloomCodeEditorProps } from '.';
import { Omit } from 'lodash';

const inlineTheme = EditorView.baseTheme({
  '&': {
    backgroundColor: 'hsl(var(--background))',
  },

  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: '#c0c0c0',
  },
  '&.cm-focused': {
    outline: 'none',
  },
});
export const inlineSetup: Extension = (() => [
  highlightSpecialChars(),
  history(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  inlineTheme,
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
])();

export type WebloomInlineEditorProps = Omit<WebloomCodeEditorProps, 'setup'>;
export const WebloomInlineEditor = (props: WebloomInlineEditorProps) => {
  return <WebloomCodeEditor setup={inlineSetup} {...props} />;
};
