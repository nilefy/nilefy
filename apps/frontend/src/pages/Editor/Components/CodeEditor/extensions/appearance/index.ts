import { Compartment, Extension, TransactionSpec } from '@codemirror/state';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import {
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
} from '@codemirror/view';
import { inlineTheme } from './inlineTheme';
export type CodeEditorTheme = 'light' | 'dark';
// the theme is a compartment for runtime reconfiguration
const themeCompartment = new Compartment();
export const setTheme = (theme?: CodeEditorTheme): TransactionSpec => {
  return {
    effects: themeCompartment.reconfigure(getThemeExtension(theme)),
  };
};
const getThemeExtension = (t: CodeEditorTheme = 'light'): Extension => {
  if (t === 'light') {
    return lightTheme;
  } else {
    return darkTheme;
  }
};

export const appearance = ({
  theme = 'light',
  inline = false,
}: {
  theme?: CodeEditorTheme;
  inline?: boolean;
}): Extension[] => {
  const inlineOrBlockTheme = inline
    ? inlineTheme
    : [highlightActiveLine(), highlightActiveLineGutter()];
  return [
    themeCompartment.of(getThemeExtension(theme)),
    highlightSpecialChars(),
    ...inlineOrBlockTheme,
  ];
};
