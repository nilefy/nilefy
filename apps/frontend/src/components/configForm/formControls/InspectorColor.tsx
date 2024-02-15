import { Label } from '@/components/ui/label';
import { BaseControlProps, InspectorColorProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { SketchPicker } from 'react-color';
import { FormControlContext } from '..';

export const InspectorColor = (
  props: InspectorColorProps & BaseControlProps,
) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <>
      <Label htmlFor={props.id}>{props.label}</Label>
      <SketchPicker
        color={props.value as string}
        onChangeComplete={(e) => {
          onChange(e.hex);
        }}
      />
    </>
  );
};
