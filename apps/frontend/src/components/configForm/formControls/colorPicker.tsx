import { SketchPicker } from 'react-color';
import { BaseControlProps, InspectorColorProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { FormControlContext } from '..';
import { Label } from '@/components/ui/label';

const InspectorColor = (props: InspectorColorProps & BaseControlProps) => {
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

export default InspectorColor;
