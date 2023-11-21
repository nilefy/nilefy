import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseControlProps } from '.';
import { Label } from '@/components/ui/label';

export type InspectorSelectProps = {
  options: { label: string; value: string }[];
  placeholder?: string;
};

const InspectorSelect = (
  props: InspectorSelectProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  return (
    <div className="flex flex-col">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select
        onValueChange={(newValue) => {
          props.onChange(newValue);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{props.placeholder}</SelectLabel>
            {props.options.map((option) => (
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
