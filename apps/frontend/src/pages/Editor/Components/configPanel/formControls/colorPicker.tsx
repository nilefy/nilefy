import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  BaseControlProps,
  InspectorColorProps,
} from '@webloom/configpaneltypes';

const InspectorColor = (
  props: InspectorColorProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  const [color, setColor] = useState('#fff');
  return (
    <SketchPicker
      color={color}
      onChangeComplete={(e: unknown) => {
        props.onChange(e.hex);
        setColor(e.hex);
      }}
    />
  );
};

export { InspectorColor };
