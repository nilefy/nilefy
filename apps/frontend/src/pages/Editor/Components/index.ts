import { createContext } from 'react';
import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';
import { WebloomTextEditorWidget } from './WebloomWidgets/RichTextEditor';
import { WebloomTextWidget } from './WebloomWidgets/Text';
import { WebloomTableWidget } from './WebloomWidgets/Table';
import { WebloomSelectWidget } from './WebloomWidgets/Select';
import { WebloomMultiSelectWidget } from './WebloomWidgets/MultiSelect';

export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
  WebloomText: WebloomTextWidget,
  TextEditor: WebloomTextEditorWidget,
  Table: WebloomTableWidget,
  WebloomSelect: WebloomSelectWidget,
  WebloomMultiSelect: WebloomMultiSelectWidget,
} as const;

export const WidgetContext = createContext<{
  /**
   * callback function that any widget can call to change one of its props in the editor state
   * @example input widget uses it to change its `props.value` on the editor state when user types
   */
  onPropChange: ({ value, key }: { value: unknown; key: string }) => void;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);

export type WidgetTypes = keyof typeof WebloomWidgets;
