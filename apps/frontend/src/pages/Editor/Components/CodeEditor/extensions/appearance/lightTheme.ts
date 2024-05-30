/**
 * @name github
 */
import { tags as t } from '@lezer/highlight';
import createSyntaxHighlightingTheme, {
  CreateSyntaxHighlightingThemeOptions,
} from './createSyntaxHighlightingTheme';
import { EditorView } from 'codemirror';
import { baseTheme } from './baseTheme';

export const defaultSettingsGithubLight: CreateSyntaxHighlightingThemeOptions['settings'] =
  {
    background: '#fff',
    foreground: '#24292e',
    selection: '#BBDFFF',
    selectionMatch: '#BBDFFF',
    gutterBackground: '#fff',
    gutterForeground: '#6e7781',
  };

export const lightThemeInit = (
  options?: Partial<CreateSyntaxHighlightingThemeOptions>,
) => {
  const { settings = {}, styles = [] } = options || {};
  return [
    baseTheme,
    createSyntaxHighlightingTheme({
      theme: 'light',
      settings: {
        ...defaultSettingsGithubLight,
        ...settings,
      },
      styles: [
        { tag: [t.standard(t.tagName), t.tagName], color: '#116329' },
        { tag: [t.comment, t.bracket], color: '#6a737d' },
        { tag: [t.className, t.propertyName], color: '#6f42c1' },
        {
          tag: [t.variableName, t.attributeName, t.number, t.operator],
          color: '#005cc5',
        },
        {
          tag: [t.keyword, t.typeName, t.typeOperator, t.typeName],
          color: '#d73a49',
        },
        { tag: [t.string, t.meta, t.regexp], color: '#032f62' },
        { tag: [t.name, t.quote], color: '#22863a' },
        { tag: [t.heading, t.strong], color: '#24292e', fontWeight: 'bold' },
        { tag: [t.emphasis], color: '#24292e', fontStyle: 'italic' },
        { tag: [t.deleted], color: '#b31d28', backgroundColor: 'ffeef0' },
        { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#e36209' },
        { tag: [t.url, t.escape, t.regexp, t.link], color: '#032f62' },
        { tag: t.link, textDecoration: 'underline' },
        { tag: t.strikethrough, textDecoration: 'line-through' },
        { tag: t.invalid, color: '#cb2431' },
        ...styles,
      ],
    }),
    EditorView.theme(
      {
        '&': {
          background: '#FFFFFF',
        },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': { background: '#FFFFFF' },
        '.cm-gutterElement': { color: '#CBD5E1' /* blueGray-300 */ },
        '.cm-foldMarker': {
          color: '#94A3B8' /* blueGray-400 */,
        },
        '.cm-activeLine, .cm-activeLineGutter': {
          background: '#F1F5F9' /* blueGray-100 */,
        },

        // Autocomplete
        '.cm-tooltip-autocomplete': {
          background: '#E2E8F0' /* blueGray-200 */,
        },
        '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
          background: '#CBD5E1' /* blueGray-300 */,
          color: '#1E293B' /* blueGray-800 */,
        },
        '.cm-completionLabel': {}, // Unmatched text
        '.cm-completionMatchedText': {
          color: '#00B4D4',
        },
        '.cm-completionDetail': {
          color: '#ABABAB',
        }, // Text to the right of tooltip

        // Diagnostics (Lint issues) & Quickinfo (Hover tooltips)
        '.cm-diagnostic, .cm-quickinfo-tooltip': {
          background: '#E2E8F0' /* blueGray-200 */,
          border: '1px solid #CBD5E1' /* blueGray-300 */,
          color: '#1E293B' /* blueGray-800 */,
        },
      },
      { dark: false },
    ),
  ];
};

export const lightTheme = lightThemeInit();
