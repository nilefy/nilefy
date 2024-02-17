import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { selectOptions } from '@/lib/Editor/interface';

function SelectComponent(props: { options: selectOptions[] }) {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Option" />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option: selectOptions) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SelectComponent;
