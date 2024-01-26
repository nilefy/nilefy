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
  };
}

export default generateWidgets();
