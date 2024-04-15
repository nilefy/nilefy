// thanks https://github.com/prisma/text-editors
import {
  autocompletion,
  completeFromList,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import {
  Diagnostic,
  linter,
  setDiagnostics as cmSetDiagnostics,
} from '@codemirror/lint';
import {
  EditorState,
  Extension,
  Facet,
  TransactionSpec,
} from '@codemirror/state';
import { EditorView, hoverTooltip, Tooltip } from '@codemirror/view';
import throttle from 'lodash/throttle';
import { displayPartsToString } from 'typescript';
import { onChangeCallback } from '../onChange';
import { editorStore } from '@/lib/Editor/Models';
import { AutocompleteRequest } from '@/lib/Editor/workers/common/interface';
import { nanoid } from 'nanoid';

type TSWorker = (typeof editorStore)['workerBroker']['tsServer'];

const fileNameFacet = Facet.define<string, string>({
  compare: (a, b) => a === b,
  combine: (values) => values[0],
});

const tsWorkerFacet = Facet.define<TSWorker, TSWorker>({
  compare() {
    // never changes
    return false;
  },
  combine(value) {
    return value[0];
  },

  static: true,
});

/**
 * A CompletionSource that returns completions to show at the current cursor position (via tsserver)
 */
const completionSource = async (
  ctx: CompletionContext,
): Promise<CompletionResult | null> => {
  const { state, pos } = ctx;
  const ts = state.facet(tsWorkerFacet);
  const fileName = state.facet(fileNameFacet);
  const content = ctx.state.doc.toString();
  const lastCharacter = content.charAt(pos - 1);
  //Prevent completions from appearing on certain characters

  if (
    ['"', "'", ';', '(', ')', '{', ',', ' ', '=', '<', '>'].includes(
      lastCharacter,
    )
  ) {
    return { from: ctx.pos, options: [] };
  }

  try {
    const autoCompleteRequest: AutocompleteRequest = {
      event: 'autoComplete',
      body: {
        requestId: nanoid(),
        fileName,
        fileContent: content,
        position: pos,
      },
    };
    const completions = await ts.autoCompleteRequest(autoCompleteRequest);
    if (!completions) {
      console.log('Unable to get completions', { pos, fileName, content });
      return null;
    }

    return completeFromList(
      completions.entries.map((c) => ({
        type: c.kind,
        label: c.name,
        boost: 1 / Number(c.sortText),
      })),
    )(ctx);
  } catch (e) {
    console.error('Error getting completions', e);
    return null;
  }
};

/**
 * A LintSource that returns lint diagnostics across the current editor view (via tsserver)
 */
const lintDiagnostics = async (state: EditorState): Promise<Diagnostic[]> => {
  const ts = state.facet(tsWorkerFacet);
  const fileName = state.facet(fileNameFacet);
  const diagnostics = (await ts.lintDiagnosticRequest(
    fileName,
  )) as Diagnostic[];
  return diagnostics;
};
/**
 * A HoverTooltipSource that returns a Tooltip to show at a given cursor position (via tsserver)
 */
const hoverTooltipSource = async (
  state: EditorState,
  pos: number,
): Promise<Tooltip | null> => {
  const ts = state.facet(tsWorkerFacet);
  const fileName = state.facet(fileNameFacet);
  const quickInfo = await ts.quickInfo(fileName, pos);
  if (!quickInfo) {
    return null;
  }

  return {
    pos,
    create() {
      //todo syntax highlight the tooltip
      const dom = document.createElement('div');
      dom.setAttribute('class', 'cm-quickinfo-tooltip');
      dom.textContent =
        displayPartsToString(quickInfo.displayParts) +
        (quickInfo.documentation?.length
          ? '\n' + displayPartsToString(quickInfo.documentation)
          : '');

      return {
        dom,
      };
    },
    above: false, // HACK: This makes it so lint errors show up on TOP of this, so BOTH quickInfo and lint tooltips don't show up at the same time
  };
};

export type FileMap = Map<string, string>;

/**
 * A TransactionSpec that can be dispatched to force re-calculation of lint diagnostics
 */
export async function setDiagnostics(
  state: EditorState,
): Promise<TransactionSpec> {
  const diagnostics = await lintDiagnostics(state);
  return cmSetDiagnostics(state, diagnostics);
}

/**
 * A (throttled) function that updates the view of the currently open "file" on TSServer
 */
const updateTSFileThrottled = throttle((code: string, view: EditorView) => {
  const ts = view.state.facet(tsWorkerFacet);
  const fileName = view.state.facet(fileNameFacet);
  ts.updateFile(fileName, code);
}, 100);

// Export a function that will build & return an Extension
export function typescript(fileName: string): Extension {
  return [
    tsWorkerFacet.of(editorStore.workerBroker.tsServer),
    fileNameFacet.of(fileName),
    javascript({ typescript: true, jsx: false }),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 30,
      override: [completionSource],
    }),
    linter((view) => lintDiagnostics(view.state)),
    hoverTooltip((view, pos) => hoverTooltipSource(view.state, pos), {
      hideOnChange: true,
    }),
    EditorView.updateListener.of(({ view, docChanged, focusChanged }) => {
      if (docChanged) {
        // Update tsserver's view of this file
        updateTSFileThrottled(view.state.sliceDoc(0), view);
      }
      if (focusChanged) {
        if (view.hasFocus) {
          // Update tsserver's view of this file
          updateTSFileThrottled(view.state.sliceDoc(0), view);
          // setDiagnostics(view.state).then((spec) => view.dispatch(spec));
        } else {
          // // Remove the file from tsserver's view
          // const ts = view.state.facet(tsWorkerFacet);
          // ts.removeFile(fileName);
        }
      }
    }),

    onChangeCallback(async (_code, view) => {
      // Re-compute lint diagnostics via tsserver
      view.dispatch(await setDiagnostics(view.state));
    }),
  ];
}
