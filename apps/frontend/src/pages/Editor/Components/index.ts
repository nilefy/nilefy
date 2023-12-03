import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';
import { WebloomTextEditorWidget } from './WebloomWidgets/RichTextEditor';
import { WebloomTextWidget } from './WebloomWidgets/Text';
import { WebloomTableWidget } from './WebloomWidgets/Table';
export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
  WebloomText: WebloomTextWidget,
  TextEditor: WebloomTextEditorWidget,
  Table: WebloomTableWidget,
} as const;

export type WidgetTypes = keyof typeof WebloomWidgets;
