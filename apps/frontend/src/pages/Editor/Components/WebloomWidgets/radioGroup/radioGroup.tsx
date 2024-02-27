import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { selectOptions } from '@/lib/Editor/interface';

export function RadioGroupComponent(props: {
  options: selectOptions[];
  onPropChange: ({ value, key }: { value: string; key: string }) => void;
  value: string;
}) {
  return (
    <RadioGroup
      value={props.value}
      onValueChange={(e) => {
        props.onPropChange({
          key: 'value',
          value: e,
        });
      }}
    >
      {props.options.map((option: selectOptions) => (
        <div className="flex items-center space-x-2" key={option.value}>
          <RadioGroupItem id={option.value} value={option.value} />
          <Label htmlFor={option.value}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
