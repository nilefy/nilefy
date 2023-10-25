import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';

export const VarCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta;
  const tableMeta = table.options.meta;
  const [isFirst, setIsFirst] = useState(row.index == 0);
  const [value, setValue] = useState(initialValue);

  // If the initialValue is changed externally, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    tableMeta?.updateData(row.index, column.id, value);
  };

  const onSelectChange = (selectedValue: string) => {
    setValue(selectedValue);
    tableMeta?.updateData(row.index, column.id, selectedValue);
  };
  const setPlaceholder = (value: string) => {
    // i wanna put the placeholder , depending on the type of the column Name
    if (value === '' && column.id === 'name') {
      return 'Enter a name';
    }
    if (value === '' && column.id === 'type') {
      return 'Select..';
    }
    if (value === '' && column.id === 'default') {
      return 'NULL';
    }
    return value;
  };

  {
    return columnMeta?.type === 'select' ? (
      <Select
        onValueChange={onSelectChange}
        value={row.index == 0 ? '' : getValue()}
        disabled={isFirst}
      >
        <SelectTrigger className={isFirst ? 'disabled:cursor-default' : ''}>
          <SelectValue placeholder={setPlaceholder(getValue())} />
        </SelectTrigger>
        <SelectContent>
          {columnMeta?.options?.map((option: Option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        disabled={isFirst}
        className={isFirst ? 'disabled:cursor-default' : ''}
        placeholder={setPlaceholder(getValue())}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        type={columnMeta?.type || 'text'}
      />
    );
  }
};
