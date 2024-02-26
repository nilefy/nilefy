import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { BaseControlProps, InspectorSelectProps } from '@/lib/Editor/interface';
import { Label } from '@/components/ui/label';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorSelect = (props: InspectorSelectProps & BaseControlProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Select
        onValueChange={(newValue) => {
          onChange(newValue);
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

export default InspectorSelect;