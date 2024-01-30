import { createContext } from 'react';
import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';
import { WebloomTextEditorWidget } from './WebloomWidgets/RichTextEditor';
import { WebloomTextWidget } from './WebloomWidgets/Text';
import { WebloomTableWidget } from './WebloomWidgets/Table';
import { WebloomFormWidget } from './WebloomWidgets/Form';

export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
  WebloomText: WebloomTextWidget,
  TextEditor: WebloomTextEditorWidget,
  Table: WebloomTableWidget,
  WebloomForm: WebloomFormWidget,
} as const;

export const WidgetContext = createContext<{
  onPropChange: ({ value, key }: { value: unknown; key: string }) => void;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);

export type WidgetTypes = keyof typeof WebloomWidgets;
