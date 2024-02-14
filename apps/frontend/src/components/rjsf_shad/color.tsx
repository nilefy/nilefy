import { SketchPicker } from 'react-color';
import { Label } from '@/components/ui/label';
import {
  labelValue,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';

export default function ColorPickerWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ id, value, label, hideLabel, onChange }: WidgetProps<T, S, F>) {
  return (
    <>
      {labelValue(<Label htmlFor={id}>{label || undefined}</Label>, hideLabel)}
      <SketchPicker
        color={value}
        onChangeComplete={(e) => {
          onChange(e.hex);
        }}
      />
    </>
  );
}
