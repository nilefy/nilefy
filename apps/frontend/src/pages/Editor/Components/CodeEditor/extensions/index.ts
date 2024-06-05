import { lineNumbers, placeholder } from '@codemirror/view';
import { appearance } from './appearance';
import { baseSetup } from './base';
import { typescript } from './typescript';

type CodeEditorExtensionsSetup = {
  theme?: 'light' | 'dark';
  inline?: boolean;
  fileName: string;
};
export const codeEditorExtensionsSetup = ({
  theme = 'light',
  inline = false,
}: CodeEditorExtensionsSetup) => {
  return [...baseSetup(), ...appearance({ theme, inline })];
};

type InlineCodeEditorExtensionsSetup = {
  theme?: 'light' | 'dark';
  placeholderText?: string;
  fileName: string;
  isEvent?: boolean;
};

export const inlineCodeEditorExtensionsSetup = ({
  theme = 'light',
  placeholderText = 'Enter something',
  fileName,
  isEvent: isAction,
}: InlineCodeEditorExtensionsSetup) => {
  return [
    ...baseSetup(),
    ...appearance({ theme, inline: true }),
    placeholder(placeholderText),
    typescript(fileName, true, isAction),
  ];
};

export const blockCodeEditorExtensionsSetup = ({
  theme = 'light',
  fileName,
}: CodeEditorExtensionsSetup) => {
  return [
    ...baseSetup(),
    ...appearance({ theme, inline: false }),
    lineNumbers(),
    typescript(fileName),
  ];
};
