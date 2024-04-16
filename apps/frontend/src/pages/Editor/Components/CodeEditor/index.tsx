import { EditorView, ViewUpdate, placeholder } from '@codemirror/view';
import { useEffect, useMemo, useRef, useState } from 'react';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { sql, PostgreSQL } from '@codemirror/lang-sql';

import {
  Annotation,
  Compartment,
  EditorState,
  EditorStateConfig,
  Extension,
  StateEffect,
  StateField,
} from '@codemirror/state';

import { basicSetup } from 'codemirror';
import { cn } from '@/lib/cn';
import { language } from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete';
import { blockCodeEditorExtensionsSetup } from './extensions';
import { useTheme } from '@/components/theme-provider';

const External = Annotation.define<boolean>();

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
  templateAutocompletionOnly?: boolean;
  setup: Extension;
  id?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};
/**
 *
 * @param props please use `useCallback` to memoize the onChange function before passing it to the editor
 *
 */

// prettier-ignore
const autoCompletionConf = new Compartment;
// regex to match unclosed template "{{" if there's any balanced "}}" after it then it won't match
const oneSideTemplate = /{{(?![^}]*}})/g;
const setAutoCompletionAllowed = EditorState.transactionExtender.of((tr) => {
  if (!tr.docChanged) return null;
  const inJavascriptTemplate =
    tr.state.sliceDoc(0, tr.selection?.main.head || 0).match(oneSideTemplate)
      ?.length || 0 > 0;
  const stateIsJavscript = tr.startState.facet(language) == javascriptLanguage;
  if (stateIsJavscript === inJavascriptTemplate) return null;
  return {
    effects: autoCompletionConf.reconfigure(
      inJavascriptTemplate ? autocompletion() : [],
    ),
  };
});

export function WebloomCodeEditor(props: WebloomCodeEditorProps) {
  const {
    initialState,
    onChange,
    autoFocus = false,
    value = '',
    onFocus,
    onBlur,
    setup,
  } = props;
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

  const extensions = useMemo(() => {
    const extensions = [setup, javascript()];
    if (props.templateAutocompletionOnly) {
      extensions.push(...[autoCompletionConf.of([]), setAutoCompletionAllowed]);
    } else {
      extensions.push(autoCompletionConf.of(autocompletion()));
    }
    return extensions;
  }, [setup, props.templateAutocompletionOnly]);
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
      const focusListner = EditorView.domEventObservers({
        focus: onFocus,
        blur: onBlur,
      });

      const config: EditorStateConfig = {
        doc: value,
        extensions: [...getExtensions, focusListner],
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
  }, [state, container, onFocus, onBlur]);

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

  return (
    <div
      id={props.id}
      ref={editor}
      className={cn(
        'w-full h-full [&[contenteditable]]:focus:border-none [&[contenteditable]]:focus:outline-none [&[contenteditable]]:active:border-none [&[contenteditable]]:active:outline-none        ',
        props.className,
      )}
    />
  );
}

export const inlineSetupCallback = (
  placeholderText: string = 'Enter something',
) => [
  placeholder(placeholderText),
  basicSetup,
  sql({
    dialect: PostgreSQL,
  }),
];

export type WebloomSQLEditorProps = Omit<WebloomCodeEditorProps, 'setup'> & {
  placeholder?: string;
};

export function SQLEditor(props: WebloomSQLEditorProps) {
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
}

export type CodeInputProps = Omit<WebloomCodeEditorProps, 'setup'> & {
  fileName: string;
};
export function CodeInput(props: CodeInputProps) {
  const { fileName, ...rest } = props;
  const theme = useTheme().activeTheme;
  const setup = useMemo(
    () => blockCodeEditorExtensionsSetup({ theme, fileName }),
    [fileName, theme],
  );

  return (
    <WebloomCodeEditor
      setup={setup}
      {...rest}
      className="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[200px] w-full overflow-auto rounded-md border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
