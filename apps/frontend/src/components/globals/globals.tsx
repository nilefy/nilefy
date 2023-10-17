import { useCodeMirror } from '@uiw/react-codemirror';
import { useEffect, useRef } from 'react';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { CompletionContext } from '@codemirror/autocomplete';
// import {
//   MatchDecorator,
//   Decoration,
//   EditorView,
//   ViewPlugin,
//   DecorationSet,
//   ViewUpdate,
// } from '@codemirror/view';
// import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
// import { syntaxTree } from '@codemirror/language';

//
// function myCompletions(context: CompletionContext) {
//   const before = context.matchBefore(/\w+/);
//   // If completion wasn't explicitly started and there
//   // is no word before the cursor, don't open completions.
//   if (!context.explicit && !before) return null;
//   return {
//     from: before ? before.from : context.pos,
//     options: completions,
//     validFor: /^\w*$/,
//   };
// }

// function myCompletions2(context: CompletionContext) {
//   const before = context.matchBefore(/\w+/);
//   // If completion wasn't explicitly started and there
//   // is no word before the cursor, don't open completions.
//   if (!context.explicit && !before) return null;
//   return {
//     from: before ? before.from : context.pos,
//     options: javascriptLanguage,
//     validFor: /^\w*$/,
//   };
// }
// const templateMark = Decoration.mark({ class: 'loom-jstemplate' });
// const templateBaseTheme = EditorView.baseTheme({
//   'loom-jstemplate': { textDecoration: 'underline 3px red' },
// });
// const templateMatcher = new MatchDecorator({
//   regexp: /\[\[(\w+)\]\]/g,
//   decoration: templateMark,
// });
//
// const templates = ViewPlugin.fromClass(
//   class {
//     placeholders: DecorationSet;
//     constructor(view: EditorView) {
//       this.placeholders = templateMatcher.createDeco(view);
//     }
//     update(update: ViewUpdate) {
//       this.placeholders = templateMatcher.updateDeco(update, this.placeholders);
//     }
//   },
//   {
//     decorations: (instance) => instance.placeholders,
//     provide: (plugin) =>
//       EditorView.atomicRanges.of((view) => {
//         return view.plugin(plugin)?.placeholders || Decoration.none;
//       }),
//   },
// );

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

const webLoomContext = javascriptLanguage.data.of({
  autocomplete: webloomCompletions,
});

const extensions = [
  javascript(),
  webLoomContext,
  // templateBaseTheme,
  // templateMatcher,
  // templates,
  // autocompletion({ override: [myCompletions2] }),
  // jsDocCompletions,
  // jsDocCompletions2,
];

export function Globals() {
  const editor = useRef<HTMLDivElement>(null);
  const { setContainer } = useCodeMirror({
    container: editor.current,
    extensions: extensions,
    basicSetup: {
      closeBrackets: true,
      autocompletion: true,
      lineNumbers: true,
    },
    theme: 'dark',
  });
  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div ref={editor} className="w-2/3" />
    </div>
  );
}
