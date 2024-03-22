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
import { useContext, useEffect, useState } from 'react';
import { EntityFormControlContext } from '..';
import { autorun } from 'mobx';
import { editorStore } from '@/lib/Editor/Models';

const InspectorSelect = (props: InspectorSelectProps & BaseControlProps) => {
  const { onChange, value, entityId, id } = useContext(
    EntityFormControlContext,
  );
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  useEffect(
    () =>
      autorun(() => {
        if ('items' in props) {
          setItems(props.items);
        } else {
          setItems(
            props.convertToOptions(
              editorStore.getEntityById(entityId)?.getValue(props.path) || [],
            ),
          );
        }
      }),
    [props, entityId],
  );
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
            {items.map((option) => (
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
