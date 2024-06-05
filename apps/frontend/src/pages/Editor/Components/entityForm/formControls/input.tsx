import { Input } from '@/components/ui/input';
import { BaseControlProps, InspectorInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { EntityFormControlContext } from '..';

const InspectorInput = (props: InspectorInputProps & BaseControlProps) => {
  const { onChange, value, id } = useContext(EntityFormControlContext);
  return (
    <div className="flex flex-col space-y-3">
      <Input
        {...props}
        id={id}
        value={value as string}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
};

export default InspectorInput;
