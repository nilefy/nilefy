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
import {
  RegExpCursor,
  highlightSelectionMatches,
  searchKeymap,
} from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  crosshairCursor,
  dropCursor,
  highlightSpecialChars,
  keymap,
  placeholder,
  rectangularSelection,
} from '@codemirror/view';
import { WebloomCodeEditor, WebloomCodeEditorProps } from '.';
import { Omit } from 'lodash';
import { useMemo } from 'react';

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
  '.cm-jstemplate': {
    backgroundColor: '#85edff49',
  },
});
// HIGHLIGHT JS TEMPLATEs
const templateMarkDeco = Decoration.mark({ class: 'cm-jstemplate' });
/**
 * extension that adds new class to use in the mark
 */

//todo: fix this, new lines breaks the plugin
//todo: move it into lib
const jsTemplatePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.getDeco(view);
    }
    getDeco(view: EditorView) {
      const templateRegexString = '\\{\\{([^}]+)\\}\\}';
      const { state } = view;
      const decos = [];
      for (const part of view.visibleRanges) {
        const cursor = new RegExpCursor(
          state.doc,
          templateRegexString,
          {},
          part.from,
          part.to,
        );
        for (const match of cursor) {
          const { from, to } = match;
          decos.push(templateMarkDeco.range(from, to));
        }
      }
      return Decoration.set(decos);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.getDeco(update.view);
      }
    }
  },
  {
    decorations: (instance) => instance.decorations,
  },
);

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
  autocompletion(),
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
