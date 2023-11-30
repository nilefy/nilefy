import { BaseControlProps } from '@webloom/configpaneltypes';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { EditorState } from '@codemirror/state';

const SqlEditor = ({
  value,
  id,
  onChange,
}: BaseControlProps & {
  value?: string;
  onChange: (newValue: string) => void;
}) => {
  const editor = useRef<HTMLDivElement>(null);
  // add extenion to update the state when the view changes
  const onUpdate = EditorView.updateListener.of((update) => {
    onChange(update.state.doc.toString());
  });
  useEffect(() => {
    if (!editor.current) return;
    const editorState = EditorState.create({
      doc: value ?? '',
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

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div key={id} className="flex h-full w-full items-center justify-center">
      <div ref={editor} className="h-12 w-2/3 " />
    </div>
  );
};

export { SqlEditor };
