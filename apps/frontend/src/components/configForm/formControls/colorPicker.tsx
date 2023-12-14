import { SketchPicker } from 'react-color';
import {
  BaseControlProps,
  InspectorColorProps,
} from '@webloom/configpaneltypes';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorColor = (props: InspectorColorProps & BaseControlProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <SketchPicker
      color={props.color}
      onChangeComplete={(e) => {
        onChange(e.hex);
      }}
    />
  );
};

export { InspectorColor };
