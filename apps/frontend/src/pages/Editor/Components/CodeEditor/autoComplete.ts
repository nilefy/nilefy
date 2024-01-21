import { editorStore } from '@/lib/Editor/Models';
import {
  Completion,
  CompletionContext,
  CompletionSource,
} from '@codemirror/autocomplete';
import {
  completionPath,
  javascriptLanguage,
} from '@codemirror/lang-javascript';
const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;

function enumeratePropertyCompletions(
  obj: Record<string, unknown>,
  top: boolean,
): readonly Completion[] {
  const options = [],
    seen: Set<string> = new Set();
  for (let depth = 0; ; depth++) {
    //todo : return methods as well
    for (const name of Object.keys(obj)) {
      if (seen.has(name)) continue;
      seen.add(name);
      let value;
      try {
        value = obj[name];
      } catch (_) {
        continue;
      }
      options.push({
        label: name,
        type:
          typeof value == 'function'
            ? /^[A-Z]/.test(name)
              ? 'class'
              : top
              ? 'function'
              : 'method'
            : top
            ? 'variable'
            : 'property',
        boost: -depth,
      });
    }
    const next = Object.getPrototypeOf(obj);
    if (!next) return options;
    obj = next;
  }
}

/// Defines a [completion source](#autocomplete.CompletionSource) that
/// completes from the given scope object (for example `globalThis`).
/// Will enter properties of the object when completing properties on
/// a directly-named path.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scopeCompletionSource(scope: any): CompletionSource {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache: Map<any, readonly Completion[]> = new Map();
  return (context: CompletionContext) => {
    const path = completionPath(context);
    if (!path) return null;
    let target = scope;
    for (const step of path.path) {
      target = target[step];
      if (!target) return null;
    }
    let options = cache.get(target);
    if (!options)
      cache.set(
        target,
        (options = enumeratePropertyCompletions(target, !path.path.length)),
      );
    return {
      from: context.pos - path.name.length,
      options,
      validFor: Identifier,
    };
  };
}

function webloomCompletions(context: CompletionContext) {
  const before = context.matchBefore(/\w+/);
  // If completion wasn't explicitly started and there
  // is no word before the cursor, don't open completions.
  if (!context.explicit && !before) return null;
  // very naive implementation of the completion till we implement the real one
  const autoCompleteObject = editorStore.currentPage.context;

  const result = scopeCompletionSource(autoCompleteObject)(context);
  return result;
}

/**
 * extension that add the custom completion source to the js lang
 */
export const webLoomContext = javascriptLanguage.data.of({
  autocomplete: webloomCompletions,
});
