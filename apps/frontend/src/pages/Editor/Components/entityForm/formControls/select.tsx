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
import { useContext } from 'react';
import { EntityFormControlContext } from '..';

const InspectorSelect = (props: InspectorSelectProps & BaseControlProps) => {
  const { onChange, value, id } = useContext(EntityFormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Select
        onValueChange={(newValue) => {
          onChange(newValue);
        }}
        value={value as string}
      >
        <SelectTrigger id={id}>
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
