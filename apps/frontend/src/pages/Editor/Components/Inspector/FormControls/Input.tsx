import { Input, InputProps } from '@/components/ui/input';
import { BaseControlProps } from '.';
import { Label } from '@/components/ui/label';

export type InspectorInputProps = Partial<
  Pick<InputProps, 'type' | 'placeholder' | 'max' | 'min'>
>;

const InspectorInput = (
  props: InspectorInputProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  return (
    <div className="flex flex-col">
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
