import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  BaseControlProps,
  InspectorSelectProps,
} from '@webloom/configpaneltypes';
import { Label } from '@/components/ui/label';

const InspectorSelect = (
  props: InspectorSelectProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  return (
    <div className="flex flex-col space-y-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select
        onValueChange={(newValue) => {
          props.onChange(newValue);
        }}
        value={props.value as string}
      >
        <SelectTrigger>
          <SelectValue placeholder={props.placeholder || 'Select one option'} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{props.placeholder}</SelectLabel>
            {props.items.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export { InspectorSelect };
