import { basicSetup } from 'codemirror';
import {
  EditorView,
  MatchDecorator,
  Decoration,
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
} from '@codemirror/view';
import { useEffect, useMemo, useRef, useState } from 'react';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { CompletionContext } from '@codemirror/autocomplete';
import {
  Annotation,
  EditorState,
  StateEffect,
  StateField,
} from '@codemirror/state';

const External = Annotation.define<boolean>();
// TODO: change this to real context we want to share the user

const completions = [
  { label: 'panic', type: 'keyword' },
  { label: 'park', type: 'constant', info: 'Test completion' },
  { label: 'password', type: 'variable' },
];

function webloomCompletions(context: CompletionContext) {
  const before = context.matchBefore(/\w+/);
  // If completion wasn't explicitly started and there
  // is no word before the cursor, don't open completions.
  if (!context.explicit && !before) return null;
  return {
    from: before ? before.from : context.pos,
    options: completions,
    validFor: /^\w*$/,
  };
}

/**
 * extension that add the custom completion source to the js lang
 */
const webLoomContext = javascriptLanguage.data.of({
  autocomplete: webloomCompletions,
});

// HIGHLIGHT JS TEMPLATEs
const templateMarkDeco = Decoration.mark({ class: 'cm-jstemplate' });
/**
 * extension that adds new class to use in the mark
 */
const templateBaseTheme = EditorView.baseTheme({
  '.cm-jstemplate': { backgroundColor: '#d0edf5' },
});

const templateMatcher = new MatchDecorator({
  regexp: /{{(.*?)}}/g,
  decoration: templateMarkDeco,
});

//todo: fix this, new lines breaks the plugin
//todo: move it into lib
const jsTemplatePlugin = ViewPlugin.fromClass(
  class {
    templates: DecorationSet;
    constructor(view: EditorView) {
      this.templates = templateMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.templates = templateMatcher.updateDeco(update, this.templates);
    }
  },
  {
    decorations: (instance) => instance.templates,
  },
);

/**
 * produce the extension that highlights the js template with `cm-loom-jstemplate`
 */

type WebloomCodeEditorProps = {
  initialState?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields?: Record<string, StateField<any>>;
  };
  onChange?: (value: string, view: ViewUpdate) => void;
  autoFocus?: boolean;
  value?: string;
};
/**
 *
 * @param props please use `useCallback` to memoize the onChange function before passing it to the editor
 *
 */
export function WebloomCodeEditor(props: WebloomCodeEditorProps) {
  const { initialState, onChange, autoFocus = true, value = '' } = props;
  const editor = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView>();
  const [state, setState] = useState<EditorState>();

  const updateListener = EditorView.updateListener.of(
    (viewUpdate: ViewUpdate) => {
      if (
        viewUpdate.docChanged &&
        typeof onChange === 'function' &&
        // Fix echoing of the remote changes:
        // If transaction is market as remote we don't have to call `onChange` handler again
        !viewUpdate.transactions.some((tr) => tr.annotation(External))
      ) {
        const doc = viewUpdate.state.doc;
        const value = doc.toString();
        onChange(value, viewUpdate);
      }
      // onStatistics && onStatistics(getStatistics(vu));
    },
  );

  const extension = useMemo(
    () => [
      basicSetup,
      javascript(),
      updateListener,
      webLoomContext,
      templateBaseTheme,
      jsTemplatePlugin,
    ],
    [updateListener],
  );

  useEffect(
    () => () => {
      if (view) {
        view.destroy();
        setView(undefined);
      }
    },
    [view],
  );
  useEffect(() => {
    const container = editor.current;
    if (container && !state) {
      const config = {
        doc: value,
        extension,
      };
      const stateCurrent = initialState
        ? EditorState.fromJSON(initialState.json, config, initialState.fields)
        : EditorState.create(config);
      setState(stateCurrent);
      if (!view) {
        const viewCurrent = new EditorView({
          state: stateCurrent,
          parent: container,
        });
        setView(viewCurrent);
        // onCreateEditor && onCreateEditor(viewCurrent, stateCurrent);
      }
    }
    return () => {
      if (view) {
        setState(undefined);
        setView(undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, editor]);

  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);

  useEffect(() => {
    if (view) {
      view.dispatch({ effects: StateEffect.reconfigure.of(extension) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extension, onChange]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    const currentValue = view ? view.state.doc.toString() : '';
    //in case value passed from outside changed
    if (view && value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || '' },
        annotations: [External.of(true)],
      });
    }
  }, [value, view]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div ref={editor} className="h-8 w-2/3 " />
    </div>
  );
}

export function SQLEditor() {
  const editor = useRef<HTMLDivElement>(null);
  /**
   * to hold the editor state outside the editor
   */
  const [code, setCode] = useState('');
  // add extenion to update the state "code" when the view changes
  const onUpdate = EditorView.updateListener.of((update) =>
    setCode(update.state.doc.toString()),
  );
  useEffect(() => {
    if (!editor.current) return;
    console.log('inside the hook');
    const editorState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        sql({
          dialect: PostgreSQL,
        }),
        onUpdate,
      ],
    });
    const view = new EditorView({
      state: editorState,
      parent: editor.current,
    });

    return () => view.destroy();
  }, []);

  console.log('code', code);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div ref={editor} className="h-8 w-2/3 " />
    </div>
  );
}
