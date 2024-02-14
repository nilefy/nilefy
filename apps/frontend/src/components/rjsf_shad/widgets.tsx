import SortableListWidget from './sortableList';
import InlineCodeInputWidget from './inlineCodeInput';
import ColorPickerWidget from './color';
import RangeWidget from './range';
import CheckboxWidget from './checkbox';
import CheckboxesWidget from './checkboxes';
import TextareaWidget from './textarea';
import SelectWidget from './select';
import RadioWidget from './radio';
import {
  FormContextType,
  RegistryWidgetsType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import SQLRJSFWidget from './sqlEditor';

export function generateWidgets<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(): RegistryWidgetsType<T, S, F> {
  return {
    CheckboxWidget,
    TextareaWidget,
    RangeWidget,
    CheckboxesWidget,
    SelectWidget,
    RadioWidget,
    sql: SQLRJSFWidget,
    colorPicker: ColorPickerWidget,
    inlineCodeInput: InlineCodeInputWidget,
    sortableList: SortableListWidget,
  };
}

export default generateWidgets();
