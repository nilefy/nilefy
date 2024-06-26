import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { useContext, useEffect, useRef } from 'react';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { EditorState } from '@codemirror/state';
import { EntityFormControlContext } from '..';

const SqlEditor = () => {
  const { onChange, value, id } = useContext(EntityFormControlContext);
  const editor = useRef<HTMLDivElement>(null);
  // add extenion to update the state when the view changes
  const onUpdate = EditorView.updateListener.of((update) => {
    onChange(update.state.doc.toString());
  });
  useEffect(() => {
    if (!editor.current) return;
    const editorState = EditorState.create({
      doc: (value as string) ?? '',
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

export default SqlEditor;
