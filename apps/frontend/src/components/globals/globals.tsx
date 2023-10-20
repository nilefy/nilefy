import { basicSetup } from 'codemirror';
import {
  EditorView,
  MatchDecorator,
  Decoration,
  ViewPlugin,
  DecorationSet,
  ViewUpdate,
} from '@codemirror/view';
import { useEffect, useRef, useState } from 'react';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { CompletionContext } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';

// const tagOptions = [
//   'constructor',
//   'deprecated',
//   'link',
//   'param',
//   'returns',
//   'type',
// ].map((tag) => ({ label: '@' + tag, type: 'keyword' }));
// function completeJSDoc(context: CompletionContext) {
//   const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
//   if (
//     nodeBefore.name != 'BlockComment' ||
//     context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != '/**'
//   )
//     return null;
//   const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
//   const tagBefore = /@\w*$/.exec(textBefore);
//   if (!tagBefore && !context.explicit) return null;
//   return {
//     from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
//     options: tagOptions,
//     validFor: /^(@\w*)?$/,
//   };
// }
// const jsDocCompletions = javascriptLanguage.data.of({
//   autocomplete: completeJSDoc,
// });
//
// const jsDocCompletions2 = javascriptLanguage.data.of({
//   autocomplete: myCompletions,
// });
//

// TODO: change this to real context we want to share the user
// Our list of completions (can be static, since the editor
/// will do filtering based on context).
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

const jsTemplatePlugin = ViewPlugin.fromClass(
  class {
    templates: DecorationSet;
    constructor(view: EditorView) {
      this.templates = templateMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      console.log('update happend');
      this.templates = templateMatcher.updateDeco(update, this.templates);
      console.log(this.templates.size);
    }
  },
  {
    decorations: (instance) => instance.templates,
  },
);

/**
 * produce the extension that highlights the js template with `cm-loom-jstemplate`
 */

export function Globals() {
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
        javascript(),
        onUpdate,
        webLoomContext,
        templateBaseTheme,
        jsTemplatePlugin,
      ],
    });
    const view = new EditorView({
      state: editorState,
      parent: editor.current,
    });

    return () => view.destroy();
  }, []);

  console.log('code', code);
  // const { setContainer } = useCodeMirror({
  //   container: editor.current,
  //   extensions: extensions,
  //   basicSetup: {
  //     closeBrackets: true,
  //     autocompletion: true,
  //     lineNumbers: true,
  //   },
  //   theme: 'dark',
  // });
  // useEffect(() => {
  //   if (editor.current) {
  //     setContainer(editor.current);
  //   }
  // }, [setContainer]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div ref={editor} className="h-8 w-2/3 " />
    </div>
  );
}
