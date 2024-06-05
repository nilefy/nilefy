import createSyntaxHighlightingTheme, {
  CreateSyntaxHighlightingThemeOptions,
} from './createSyntaxHighlightingTheme';
import { tags as t } from '@lezer/highlight';
import { EditorView } from 'codemirror';
import { baseTheme } from './baseTheme';
// Using https://github.com/one-dark/vscode-one-dark-theme/ as reference for the colors
const ivory = '#abb2bf',
  stone = '#7d8799', // Brightened compared to original to increase contrast
  darkBackground = '#21252b',
  highlightBackground = '#2c313a',
  background = '#282c34',
  tooltipBackground = '#353a42',
  selection = '#3E4451',
  cursor = '#528bff';

export const defaultSettingsVscodeDark: CreateSyntaxHighlightingThemeOptions['settings'] =
  {
    background: '#1e1e1e',
    foreground: '#9cdcfe',
    caret: '#c6c6c6',
    selection: '#6199ff2f',
    selectionMatch: '#72a1ff59',
    lineHighlight: '#ffffff0f',
    gutterBackground: '#1e1e1e',
    gutterForeground: '#838383',
    gutterActiveForeground: '#fff',
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
  };
function darkThemeInit(
  options?: Partial<CreateSyntaxHighlightingThemeOptions>,
) {
  const { settings = {}, styles = [] } = options || {};
  return [
    baseTheme,
    createSyntaxHighlightingTheme({
      theme: 'dark',
      settings: {
        ...defaultSettingsVscodeDark,
        ...settings,
      },
      styles: [
        {
          tag: [
            t.keyword,
            t.operatorKeyword,
            t.modifier,
            t.color,
            t.constant(t.name),
            t.standard(t.name),
            t.standard(t.tagName),
            t.special(t.brace),
            t.atom,
            t.bool,
            t.special(t.variableName),
          ],
          color: '#569cd6',
        },
        {
          tag: [t.controlKeyword, t.moduleKeyword],
          color: '#c586c0',
        },
        {
          tag: [
            t.name,
            t.deleted,
            t.character,
            t.macroName,
            t.propertyName,
            t.variableName,
            t.labelName,
            t.definition(t.name),
          ],
          color: '#9cdcfe',
        },
        { tag: t.heading, fontWeight: 'bold', color: '#9cdcfe' },
        {
          tag: [
            t.typeName,
            t.className,
            t.tagName,
            t.number,
            t.changed,
            t.annotation,
            t.self,
            t.namespace,
          ],
          color: '#4ec9b0',
        },
        {
          tag: [t.function(t.variableName), t.function(t.propertyName)],
          color: '#dcdcaa',
        },
        { tag: [t.number], color: '#b5cea8' },
        {
          tag: [
            t.operator,
            t.punctuation,
            t.separator,
            t.url,
            t.escape,
            t.regexp,
          ],
          color: '#d4d4d4',
        },
        {
          tag: [t.regexp],
          color: '#d16969',
        },
        {
          tag: [
            t.special(t.string),
            t.processingInstruction,
            t.string,
            t.inserted,
          ],
          color: '#ce9178',
        },
        { tag: [t.angleBracket], color: '#808080' },
        { tag: t.strong, fontWeight: 'bold' },
        { tag: t.emphasis, fontStyle: 'italic' },
        { tag: t.strikethrough, textDecoration: 'line-through' },
        { tag: [t.meta, t.comment], color: '#6a9955' },
        { tag: t.link, color: '#6a9955', textDecoration: 'underline' },
        { tag: t.invalid, color: '#ff0000' },
        ...styles,
      ],
    }),
    EditorView.theme(
      {
        '&': {
          color: ivory,
          backgroundColor: background,
        },
        '.cm-content': {
          caretColor: cursor,
        },
        '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
          { backgroundColor: selection },
        '.cm-panels': { backgroundColor: darkBackground, color: ivory },
        '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
        '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
        '.cm-searchMatch': {
          backgroundColor: '#72a1ff59',
          outline: '1px solid #457dff',
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
          backgroundColor: '#6199ff2f',
        },
        '.cm-activeLine': { backgroundColor: '#6699ff0b' },
        '.cm-selectionMatch': { backgroundColor: '#aafe661a' },
        '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket':
          {
            backgroundColor: '#bad0f847',
          },
        '.cm-gutters': {
          backgroundColor: background,
          color: stone,
          border: 'none',
        },
        '.cm-activeLineGutter': {
          backgroundColor: highlightBackground,
        },
        '.cm-foldPlaceholder': {
          backgroundColor: 'transparent',
          border: 'none',
          color: '#ddd',
        },
        '.cm-tooltip': {
          border: 'none',
          backgroundColor: tooltipBackground,
        },
        '.cm-tooltip .cm-tooltip-arrow:before': {
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
        },
        '.cm-tooltip .cm-tooltip-arrow:after': {
          borderTopColor: tooltipBackground,
          borderBottomColor: tooltipBackground,
        },
        '.cm-tooltip-autocomplete': {
          '& > ul > li[aria-selected]': {
            backgroundColor: highlightBackground,
            color: ivory,
          },
        },
      },
      { dark: true },
    ),
  ];
}

export const darkTheme = darkThemeInit();
