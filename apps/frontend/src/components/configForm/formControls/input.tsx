import { Input } from '@/components/ui/input';
import {
  BaseControlProps,
  InspectorInputProps,
} from '@webloom/configpaneltypes';
import { Label } from '@/components/ui/label';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorInput = (props: InspectorInputProps & BaseControlProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        {...props}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
};

export default InspectorInput;
