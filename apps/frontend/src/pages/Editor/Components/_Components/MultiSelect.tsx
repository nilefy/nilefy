'use client';
import React from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { selectOptions } from '@/lib/Editor/interface';

const MultipleSelect = (props: {
  className: string;
  options: selectOptions[];
}) => {
  const [value, setValue] = React.useState<selectOptions[]>([]);
  return (
    <div className="flex w-full flex-col">
      <MultipleSelector
        value={value}
        onChange={setValue}
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
