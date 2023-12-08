import {
  EditorView,
  MatchDecorator,
  Decoration,
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
} from '@codemirror/view';
import { useEffect, useMemo, useRef, useState } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { sql, PostgreSQL } from '@codemirror/lang-sql';

import {
  Annotation,
  EditorState,
  EditorStateConfig,
  Extension,
  StateEffect,
  StateField,
} from '@codemirror/state';

import { webLoomContext } from './autoComplete';
import { basicSetup } from 'codemirror';
import { cn } from '@/lib/cn';

const External = Annotation.define<boolean>();

// HIGHLIGHT JS TEMPLATEs
const templateMarkDeco = Decoration.mark({ class: 'cm-jstemplate' });
/**
 * extension that adds new class to use in the mark
 */

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

export type WebloomCodeEditorProps = {
  initialState?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields?: Record<string, StateField<any>>;
  };
  onChange?: (value: string, view: ViewUpdate) => void;
  className?: string;
  autoFocus?: boolean;
  value?: string;
  setup: Extension;
};
/**
 *
 * @param props please use `useCallback` to memoize the onChange function before passing it to the editor
 *
 */

export function WebloomCodeEditor(props: WebloomCodeEditorProps) {
  const { initialState, onChange, autoFocus = true, value = '', setup } = props;
  const editor = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [view, setView] = useState<EditorView>();
  const [state, setState] = useState<EditorState>();
  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, []);
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

  const extensions = useMemo(
    () => [setup, javascript(), webLoomContext, jsTemplatePlugin],
    [setup],
  );
  const getExtensions = [...extensions, updateListener];
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
    if (container && !state) {
      const config: EditorStateConfig = {
        doc: value,
        extensions: getExtensions,
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
  }, [state, container]);

  useEffect(() => {
    if (autoFocus && view) {
      view.focus();
    }
  }, [autoFocus, view]);

  useEffect(() => {
    if (view) {
      view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup, onChange]);
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

  return <div ref={editor} className={cn('w-full h-full', props.className)} />;
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