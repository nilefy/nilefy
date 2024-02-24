import MultipleSelector from '@/components/ui/multiple-selector';
import { selectOptions } from '@/lib/Editor/interface';

const MultipleSelect = (props: {
  options: selectOptions[];
  onPropChange: ({
    value,
    key,
  }: {
    value: selectOptions[];
    key: string;
  }) => void;
  value: selectOptions[];
}) => {
  return (
    <div className="flex w-full flex-col">
      <MultipleSelector
        value={props.value}
        onChange={(e) => {
          props.onPropChange({ key: 'value', value: e });
        }}
        defaultOptions={props.options}
        placeholder="Select Option"
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            no results found.
          </p>
        }
      />
    </div>
  );
};

export default MultipleSelect;
