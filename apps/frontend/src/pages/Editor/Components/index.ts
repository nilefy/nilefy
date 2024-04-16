import { createContext } from 'react';
import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';
import { WebloomTextEditorWidget } from './WebloomWidgets/RichTextEditor';
import { WebloomTextWidget } from './WebloomWidgets/Text';
import { WebloomTableWidget } from './WebloomWidgets/Table';
import { WebloomImageWidget } from './WebloomWidgets/Image';
import { WebloomChartWidget } from './WebloomWidgets/Chart';
import { WebloomSelectWidget } from './WebloomWidgets/Select';
import { WebloomMultiSelectWidget } from './WebloomWidgets/MultiSelect';
// import { WebloomDatePickerWidget } from './WebloomWidgets/DatePicker';
import { WebloomFilePickerWidget } from './WebloomWidgets/FilePicker';
import { WebloomRadioWidget } from './WebloomWidgets/radioGroup';
import { WebloomCheckBoxWidget } from './WebloomWidgets/checkBox';
import { WebloomCheckBoxGroupWidget } from './WebloomWidgets/checkBoxGroup';
import { WebloomNumberInputWidget } from './WebloomWidgets/NumberInput';
import { WebloomTextAreaWidget } from './WebloomWidgets/TextArea';
import { WebloomFormWidget } from './WebloomWidgets/Form';

export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
  WebloomNumberInput: WebloomNumberInputWidget,
  WebloomTextArea: WebloomTextAreaWidget,
  WebloomText: WebloomTextWidget,
  TextEditor: WebloomTextEditorWidget,
  Table: WebloomTableWidget,
  Image: WebloomImageWidget,
  Chart: WebloomChartWidget,
  WebloomSelect: WebloomSelectWidget,
  WebloomMultiSelect: WebloomMultiSelectWidget,
  // WebloomDatePicker: WebloomDatePickerWidget,
  WebloomFilePicker: WebloomFilePickerWidget,
  WebloomRadioGroup: WebloomRadioWidget,
  WebloomCheckBox: WebloomCheckBoxWidget,
  WebloomCheckBoxGroup: WebloomCheckBoxGroupWidget,
  WebloomForm: WebloomFormWidget,
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
