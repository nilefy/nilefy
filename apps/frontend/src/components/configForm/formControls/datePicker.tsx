import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormControlContext } from '..';
import { WebloomDatePickerProps } from '@/pages/Editor/Components/WebloomWidgets/DatePicker';

const DatePicker = (props: WebloomDatePickerProps) => {
  const { onChange } = useContext(FormControlContext);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !props.date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.date ? format(props.date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={props.date}
          onSelect={(e: Date) => {
            onChange(e);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
export default DatePicker;
