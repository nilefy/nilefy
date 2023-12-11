import React, { useContext, useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  BaseControlProps,
  InspectorColorProps,
} from '@webloom/configpaneltypes';
import { FormControlContext } from '..';

const InspectorColor = (
  props: InspectorColorProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  const [color, setColor] = useState('#fff');
  const { onChange } = useContext(FormControlContext);
  return (
    <SketchPicker
      color={color}
      onChangeComplete={(e: unknown) => {
        onChange(e.hex);
        setColor(e.hex);
      }}
    />
  );
};

export { InspectorColor };
