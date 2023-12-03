import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import {
  BaseControlProps,
  InspectorCheckboxProps,
} from '@webloom/configpaneltypes';

const InspectorCheckBox = (
  props: InspectorCheckboxProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  return (
    <div className="flex flex-row gap-2">
      <Checkbox onCheckedChange={(checked) => props.onChange(checked)} />
      <Label>{props.label}</Label>
    </div>
  );
};

export { InspectorCheckBox };
