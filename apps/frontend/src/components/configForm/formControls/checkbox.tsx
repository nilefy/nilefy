import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import {
  BaseControlProps,
  InspectorCheckboxProps,
} from '@webloom/configpaneltypes';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorCheckBox = (
  props: InspectorCheckboxProps & BaseControlProps,
) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <div className="flex flex-row gap-2">
      <Checkbox
        checked={props.value as boolean}
        onCheckedChange={(checked) => onChange(checked)}
      />
      <Label>{props.label}</Label>
    </div>
  );
};

export { InspectorCheckBox };
