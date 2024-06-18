import {
  ariaDescribedByIds,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityFormContextT } from './entityForm';
import { editorStore } from '@/lib/Editor/Models';
import { NilefyChartProps } from '@/pages/Editor/Components/NilefyWidgets/Chart/interface';
import { WebloomWidget } from '@/lib/Editor/Models/widget';

const ChartDynamicXValueWidget = function ChartDynamicXValueWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = EntityFormContextT,
>(props: WidgetProps<T, S, EntityFormContextT>) {
  const { id, placeholder, value, onChange, formContext } = props;

  const chartId = formContext?.entityId;
  if (!chartId) throw new Error('needs entity id');
  const chart = editorStore.getEntityById(chartId);
  if (!chart || !(chart instanceof WebloomWidget) || chart.type !== 'Chart')
    throw new Error('no chart with that id');
  const chartData = (chart.finalValues as NilefyChartProps).data.dataSource;

  const xValueOptions: string[] = [];
  if (chartData && chartData.length > 0) {
    xValueOptions.push(...Object.keys(chartData[0]));
  }

  return (
    <div>
      <Select
        name={id}
        aria-describedby={ariaDescribedByIds<T>(id)}
        onValueChange={onChange}
        value={value}
      >
        <SelectTrigger className="w-full">
          <SelectValue id={id} placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {xValueOptions.map((value, i) => {
            return (
              <SelectItem key={`${i}+${id}`} value={value}>
                {value}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChartDynamicXValueWidget;
