import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { CalendarDays } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@radix-ui/react-label';

export type NilefyDatePickerProps = {
  date: Date;
  label: string;
  dateFormat: string;
};

const NilefyDatePicker = observer(function NilefyDatePicker() {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, date, dateFormat } = editorStore.currentPage.getWidgetById(id)
    .finalValues as NilefyDatePickerProps;

  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, dateFormat ? dateFormat : 'PPP')
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(e) => onPropChange({ key: 'date', value: e })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});
const config: WidgetConfig = {
  name: 'DatePicker',
  icon: <CalendarDays />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 7,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const initialProps: NilefyDatePickerProps = {
  date: new Date(),
  label: 'Date',
  dateFormat: 'PPP',
};

// export const WebloomDatePickerWidget: Widget<WebloomDatePickerProps> = {
//   component: WebloomDatePicker,
//   config,
//   initialProps,
//   inspectorConfig,
// };

// export { WebloomDatePicker };
