import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { BarChartBig } from 'lucide-react';
import { ToolTipWrapper } from '../tooltipWrapper';

import { calculateAggregation } from './aggergationMethods';
import { WebloomChartProps, webloomChartProps } from './interface';
import zodToJsonSchema from 'zod-to-json-schema';
import { keys } from 'lodash';

ChartJS.register(
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  PointElement,
  LineElement,
  Title,
);
// TODO: direction
const WebloomChart = observer(function WebloomChart() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomChartProps;
  return (
    <ToolTipWrapper text={props.tooltip}>
      <div className="relative h-full w-full">
        <Chart
          type={props.chartType}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            // labeling
            // @link https://www.chartjs.org/docs/latest/axes/labelling.html
            scales: {
              x: {
                title: {
                  display: props.xAxisName !== undefined,
                  text: props.xAxisName,
                },
              },
              y: {
                title: {
                  display: props.yAxisName !== undefined,
                  text: props.yAxisName,
                },
              },
            },
            plugins: {
              /**
               * @link https://www.chartjs.org/docs/latest/configuration/legend.html#configuration-options
               */
              legend: {
                display: props.legendPosition !== 'none',
                position:
                  props.legendPosition === 'none'
                    ? 'top'
                    : props.legendPosition,
              },
              // title configuration
              // @link https://www.chartjs.org/docs/latest/configuration/title.html
              title: {
                display: props.title !== undefined,
                text: props.title,
                font: {
                  size: 18,
                },
              },
            },
          }}
          data={{
            // x-axis-value
            labels: [
              ...new Set(props.dataSource.map((row) => row[props.xAxisValue])),
            ],
            datasets: props.datasets.map((ds) => ({
              type: ds.chartType,
              label: ds.name,
              data: calculateAggregation(
                props.dataSource,
                props.xAxisValue,
                ds.yValue,
                ds.aggMethod,
              ),
              backgroundColor: ds.color,
            })),
          }}
        />
      </div>
    </ToolTipWrapper>
  );
});

const config: WidgetConfig = {
  name: 'Charts',
  icon: <BarChartBig />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 30,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomChartProps = {
  dataSource: [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ],
  datasets: [
    {
      name: 'dataset 1',
      yValue: 'count',
      aggMethod: 'sum',
      chartType: 'bar',
      color: '#165DFF',
    },
  ],
  chartType: 'bar',
  // direction: 'vertical',
  xAxisValue: 'year',

  tooltip: '',
  legendPosition: 'top',
  xAxisType: 'default',
};

const inspectorConfig: EntityInspectorConfig<WebloomChartProps> = [
  {
    sectionName: 'Content',
    children: [
      {
        label: 'Data Source',
        path: 'dataSource',
        type: 'inlineCodeInput',
        options: {
          label: 'Data Source',
        },
        validation: zodToJsonSchema(webloomChartProps.shape.dataSource),
      },
      {
        label: 'Chart Type',
        path: 'chartType',
        type: 'select',
        options: {
          items: [
            {
              label: 'Bar',
              value: 'bar',
            },
            {
              label: 'Line',
              value: 'line',
            },
            {
              label: 'Scatter',
              value: 'scatter',
            },
          ],
        },
      },
      {
        label: 'X-axis value',
        path: 'xAxisValue',
        type: 'select',
        options: {
          path: 'dataSource',
          convertToOptions(value) {
            return keys(
              (value as WebloomChartProps['dataSource'][])[0] || [],
            ).map((key) => ({
              label: key,
              value: key,
            }));
          },
        },
      },
      {
        label: 'Datasets',
        path: 'datasets',
        type: 'array',
        options: {
          newItemDefaultValue: {
            name: 'dataset 1',
            yValue: 'count',
            aggMethod: 'sum',
            chartType: 'bar',
            color: '#165DFF',
          },
          subform: [
            {
              label: 'Name',
              type: 'inlineCodeInput',
              path: 'name',
              options: {
                label: 'Name',
              },
            },
            {
              label: 'Aggregation Method',
              type: 'select',
              path: 'aggMethod',
              options: {
                items: [
                  { label: 'Sum', value: 'sum' },
                  { label: 'Average', value: 'average' },
                  { label: 'Count', value: 'count' },
                  { label: 'Max', value: 'max' },
                  { label: 'Min', value: 'min' },
                ],
              },
            },
            {
              label: 'Chart type',
              type: 'select',
              path: 'chartType',
              options: {
                items: [
                  { label: 'Bar', value: 'bar' },
                  { label: 'Line', value: 'line' },
                  { label: 'Scatter', value: 'scatter' },
                ],
              },
            },
            {
              label: 'Color',
              type: 'color',
              path: 'color',
            },
          ],
        },
        validation: zodToJsonSchema(webloomChartProps.shape.datasets),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'tooltip',
        label: 'Tooltip',
        type: 'inlineCodeInput',
        options: {
          label: 'Tooltip',
        },
      },
      {
        path: 'legendPosition',
        label: 'Legend Position',
        type: 'select',
        options: {
          items: [
            {
              label: 'Top',
              value: 'top',
            },
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Bottom',
              value: 'bottom',
            },
            {
              label: 'Right',
              value: 'right',
            },
            {
              label: 'None',
              value: 'none',
            },
          ],
        },
      },
      {
        path: 'title',
        label: 'Title',
        type: 'inlineCodeInput',
        options: {
          label: 'Title',
        },
      },
      {
        path: 'xAxisName',
        label: 'X-axis Name',
        type: 'inlineCodeInput',
        options: {
          label: 'X-axis Name',
        },
      },
      {
        path: 'yAxisName',
        label: 'Y-axis Name',
        type: 'inlineCodeInput',
        options: {
          label: 'Y-axis Name',
        },
      },
      {
        path: 'xAxisType',
        label: 'X-axis Type',
        type: 'select',
        options: {
          items: [
            {
              label: 'Default',
              value: 'default',
            },
            {
              label: 'Date',
              value: 'date',
            },
          ],
        },
      },
    ],
  },
];

const WebloomChartWidget: Widget<WebloomChartProps> = {
  component: WebloomChart,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomChartWidget };
// {
//   /* <DropdownMenu>
// <div className="flex h-full w-full justify-between rounded-2xl  border-2 p-3">
//   <DropdownMenuTrigger className="h-full w-full ">
//     <p className="line-clamp-3 flex min-h-full w-full min-w-full items-center gap-3 ">
//       <span
//         className="h-9 w-9 rounded-full"
//         style={{ backgroundColor: dataset.color }}
//       ></span>
//       <span className="bg-secondary w-fit rounded-2xl p-3">
//         {dataset.name ?? 'unconfigured'}
//       </span>
//       <span className="">{dataset.aggMethod ?? 'unconfigured'}</span>
//     </p>
//   </DropdownMenuTrigger>
// </div>

// <DropdownMenuContent side="left" className="space-y-4 p-4">
//   {children}
//   <Button
//     variant="destructive"
//     onClick={() => {
//       onDelete();
//     }}
//   >
//     Delete
//   </Button>
// </DropdownMenuContent>
// </DropdownMenu> */
// }
