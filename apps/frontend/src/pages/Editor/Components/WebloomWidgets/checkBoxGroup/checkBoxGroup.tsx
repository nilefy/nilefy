import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { selectOptions } from '@/lib/Editor/interface';

export function CheckBoxGroup(props: {
  options: selectOptions[];
  onPropChange: ({
    value,
    key,
  }: {
    value: selectOptions[];
    key: string;
  }) => void;
  value: selectOptions[];
}) {
  console.log(props.value, 'value');
  return (
    <>
      {props.options.map((option: selectOptions) => (
        <div
          className="flex items-center space-x-2 m-2 align-middle"
          key={option.value}
        >
          <Checkbox
            checked={props.value.includes(option)}
            onCheckedChange={(checked) => {
              return checked
                ? props.onPropChange({
                    key: 'value',
                    value: [...props.value, option],
                  })
                : props.onPropChange({
                    key: 'value',
                    value: props.value?.filter((value) => value !== option),
                  });
            }}
          />
          <Label>{option.label}</Label>
        </div>
      ))}
    </>
  );
}
