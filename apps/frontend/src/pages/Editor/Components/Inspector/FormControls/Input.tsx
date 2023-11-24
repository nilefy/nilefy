import { Input } from '@/components/ui/input';
import {
  BaseControlProps,
  InspectorInputProps,
} from '@webloom/configpaneltypes';
import { Label } from '@/components/ui/label';

const InspectorInput = (
  props: InspectorInputProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  return (
    <div className="flex flex-col space-y-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        {...props}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
    </div>
  );
};

export { InspectorInput };
