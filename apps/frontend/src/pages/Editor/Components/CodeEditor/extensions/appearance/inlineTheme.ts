import { RegExpCursor } from '@codemirror/search';
import {
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { EditorView } from 'codemirror';

export const highlightBindings = EditorView.theme({
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

// TODO: fix this, new lines breaks the plugin
/**
 * extension that adds new class to use in the mark
 */
export const jsTemplatePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.getDeco(view);
    }
    getDeco(view: EditorView) {
      // TODO: Why do we need two backslashes before the curly braces?
      const templateRegexString = '\\{\\{([\\s\\S]*?)\\}\\}';
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

export const inlineTheme = [highlightBindings, jsTemplatePlugin];
