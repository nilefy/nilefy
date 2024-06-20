import { Chart } from 'react-chartjs-2';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  RadarController,
  RadialLinearScale,
  ScatterController,
  Title,
  Tooltip,
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
import { NilefyChartProps, nilefyChartProps } from './interface';
import zodToJsonSchema from 'zod-to-json-schema';
import { keys } from 'lodash';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

ChartJS.register(
  /** Bar chart**/
  BarElement,
  BarController,
  /** Line chart**/
  LineElement,
  LineController,
  PointElement,
  /** Pie chart**/
  PieController,
  ArcElement,
  /** Scatter chart**/
  ScatterController,
  /** Doughnut **/
  DoughnutController,
  /** Radar **/
  RadarController,
  RadialLinearScale,
  /**Other**/
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Filler,
);

// TODO: direction
const NilefyChart = observer(function NilefyChart() {
  const { id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as NilefyChartProps;

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
  icon: BarChartBig,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 30,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const initialProps: NilefyChartProps = {
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

const inspectorConfig: EntityInspectorConfig<NilefyChartProps> = [
  {
    sectionName: 'Content',
    children: [
      {
        label: 'Data Source',
        path: 'dataSource',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Data Source',
        },
        validation: zodToJsonSchema(nilefyChartProps.shape.dataSource),
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
              (value as NilefyChartProps['dataSource'][])[0] || [],
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
          SubFormWrapper: ({
            onDelete,
            children,
            value,
          }: {
            onDelete: () => void;
            children: React.ReactNode;
            value: NilefyChartProps['datasets'][number];
          }) => {
            return (
              <DropdownMenu>
                <div className="flex h-full w-full justify-between rounded-md border-2 p-2">
                  <DropdownMenuTrigger className="h-full w-full ">
                    <div className="flex h-9 w-full min-w-full items-center gap-3 px-3 align-baseline leading-3">
                      <div className="flex w-fit flex-row items-center  gap-3">
                        <div
                          className="h-6 w-6 rounded-sm"
                          style={{ backgroundColor: value.color }}
                        ></div>
                        <div className="">{value.name ?? 'unconfigured'}</div>
                      </div>
                      <div className="ml-auto font-semibold text-gray-500">
                        {value.aggMethod ?? 'unconfigured'}
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                </div>

                <DropdownMenuContent side="left" className="space-y-4 p-4">
                  {children}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete();
                    }}
                  >
                    Delete
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
          subform: [
            {
              label: 'Name',
              type: 'inlineCodeInput',
              path: 'name',
              options: {
                placeholder: 'Enter name',
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
        validation: zodToJsonSchema(nilefyChartProps.shape.datasets),
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
          placeholder: 'Tooltip',
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
          placeholder: 'Title',
        },
      },
      {
        path: 'xAxisName',
        label: 'X-axis Name',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'X-axis Name',
        },
      },
      {
        path: 'yAxisName',
        label: 'Y-axis Name',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Y-axis Name',
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

const NilefyChartWidget: Widget<NilefyChartProps> = {
  component: NilefyChart,
  config,
  initialProps,
  inspectorConfig,
};

export { NilefyChartWidget };
