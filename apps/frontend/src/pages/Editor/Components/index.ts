import { createContext } from 'react';
import { NilefyButtonWidget } from './NilefyWidgets/Button';
import { NilefyContainerWidget } from './NilefyWidgets/Container';
import { NilefyInputWidget } from './NilefyWidgets/Input';
import { NilefyTextEditorWidget } from './NilefyWidgets/RichTextEditor';
import { NilefyTextWidget } from './NilefyWidgets/Text';
import { NilefyTableWidget } from './NilefyWidgets/Table';
import { NilefyImageWidget } from './NilefyWidgets/Image';
import { NilefyChartWidget } from './NilefyWidgets/Chart';
import { NilefySelectWidget } from './NilefyWidgets/Select';
import { NilefyMultiSelectWidget } from './NilefyWidgets/MultiSelect';
// import { WebloomDatePickerWidget } from './WebloomWidgets/DatePicker';
import { NilefyFilePickerWidget } from './NilefyWidgets/FilePicker';
import { NilefyRadioWidget } from './NilefyWidgets/radioGroup';
import { NilefyCheckBoxWidget } from './NilefyWidgets/checkBox';
import { NilefyCheckBoxGroupWidget } from './NilefyWidgets/checkBoxGroup';
import { NilefyNumberInputWidget } from './NilefyWidgets/NumberInput';
import { NilefyTextAreaWidget } from './NilefyWidgets/TextArea';
import { NilefyFormWidget } from './NilefyWidgets/Form';
import { NilefyRangeWidget } from './NilefyWidgets/Range';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { NilefyModalWidget } from './NilefyWidgets/Modal';

export const NilefyWidgets = {
  NilefyButton: NilefyButtonWidget,
  [EDITOR_CONSTANTS.WIDGET_CONTAINER_TYPE_NAME]: NilefyContainerWidget,
  NilefyInput: NilefyInputWidget,
  NilefyNumberInput: NilefyNumberInputWidget,
  NilefyTextArea: NilefyTextAreaWidget,
  NilefyText: NilefyTextWidget,
  TextEditor: NilefyTextEditorWidget,
  Table: NilefyTableWidget,
  Image: NilefyImageWidget,
  Chart: NilefyChartWidget,
  NilefySelect: NilefySelectWidget,
  NilefyMultiSelect: NilefyMultiSelectWidget,
  // NilefyDatePicker: NilefyDatePickerWidget,
  NilefyFilePicker: NilefyFilePickerWidget,
  NilefyRadioGroup: NilefyRadioWidget,
  NilefyCheckBox: NilefyCheckBoxWidget,
  NilefyCheckBoxGroup: NilefyCheckBoxGroupWidget,
  NilefyForm: NilefyFormWidget,
  NilefyRange: NilefyRangeWidget,
  NilefyModal: NilefyModalWidget,
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

export type WidgetTypes = keyof typeof NilefyWidgets;

export const EnvironmentContext = createContext<{
  isProduction: boolean;
}>({ isProduction: true });
