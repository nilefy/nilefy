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
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@radix-ui/react-label';

export type WebloomDatePickerProps = {
  date: Date;
  label: string;
  dateFormat: string;
};

const WebloomDatePicker = observer(function WebloomDatePicker() {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, date, dateFormat } = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomDatePickerProps;

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

const defaultProps: WebloomDatePickerProps = {
  date: new Date(),
  label: 'Date',
  dateFormat: 'PPP',
};
const widgetName = 'WebloomDatePicker';

// const schema: WidgetInspectorConfig<WebloomDatePickerProps> =
//   [
//   {
//     sectionName: 'General',
//     children: [
//       {
//         id: `${widgetName}-text`,
//         key: 'label',
//         label: 'Name',
//         type: 'inlineCodeInput',
//         options: {
//           placeholder: 'Enter A Name',
//           label: 'Lable',
//         },
//       },
//       {
//         id: `${widgetName}-Date`,
//         key: 'date',
//         label: 'Default Date',
//         type: 'datePicker',
//         options: {
//           date: new Date(),
//         },
//       },
//       {
//         id: `${widgetName}-DateFormat`,
//         key: 'dateFormat',
//         label: 'Date Format',
//         type: 'select',
//         options: {
//           items: [
//             { value: 'yyyy-MM-dd', label: ' 2022-01-31' },
//             { value: 'dd/MM/yyyy', label: ' 31/01/2022' },
//             { value: 'MMMM dd, yyyy', label: 'January 31, 2022' },
//             { value: 'MMMM yyyy', label: 'January 2022' },
//             { value: 'E, MMM dd yyyy', label: 'Mon, Jan 31 2022' },
//             { value: 'PPP', label: 'January 29th, 2022' },
//           ],
//         },
//       },
//     ],
//   },
// ];
// export const WebloomDatePickerWidget: Widget<WebloomDatePickerProps> = {
//   component: WebloomDatePicker,
//   config,
//   defaultProps,
//   inspectorConfig,
// };

// export { WebloomDatePicker };