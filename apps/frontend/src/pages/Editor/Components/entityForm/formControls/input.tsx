import { Input } from '@/components/ui/input';
import { BaseControlProps, InspectorInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { FormControlContext } from '..';

const InspectorInput = (props: InspectorInputProps & BaseControlProps) => {
  const { onChange, value, id } = useContext(FormControlContext);
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
