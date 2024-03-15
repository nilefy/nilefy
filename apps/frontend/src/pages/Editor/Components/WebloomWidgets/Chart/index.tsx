// import { Chart } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
// } from 'chart.js';
// import { Widget, WidgetConfig } from '@/lib/Editor/interface';
// import { useContext } from 'react';
// import { WidgetContext } from '../..';
// import { observer } from 'mobx-react-lite';
// import { editorStore } from '@/lib/Editor/Models';
// import z from 'zod';
// import { BarChartBig } from 'lucide-react';
// import { ToolTipWrapper } from '../tooltipWrapper';

// import { calculateAggregation } from './aggergationMethods';

// ChartJS.register(
//   LinearScale,
//   CategoryScale,
//   ArcElement,
//   Tooltip,
//   Legend,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
// );

// const webloomChartProps = z.object({
//   data: z.object({
//     dataSource: z.array(z.record(z.unknown())),
//     chartType: z.enum([
//       'bar',
//       'line',
//       'scatter' /**'pie', 'doughnut', 'radar'**/,
//     ]),
//     // direction: z.enum(['vertical', 'horizontal']),
//     /**
//      * which column user wants to be in x-axis
//      * @note: y-axis data is configured through datasets
//      */
//     xAxisValue: z.string(),
//     datasets: chartDatasets,
//   }),
//   tooltip: z.string().optional(),
//   layout: z.object({
//     /**
//      * @link https://www.chartjs.org/docs/latest/configuration/legend.html#position
//      * @note none will remove the legend
//      */
//     legendPosition: z
//       .enum(['top', 'left', 'bottom', 'right', 'none'])
//       .default('top'),
//     title: z.string().optional(),
//     xAxisName: z.string().optional(),
//     yAxisName: z.string().optional(),
//     xAxisType: z.enum(['default', 'date']).default('default'),
//   }),
// });

// export type WebloomChartProps = z.infer<typeof webloomChartProps>;

// // TODO: direction
// const WebloomChart = observer(function WebloomChart() {
//   const { id } = useContext(WidgetContext);
//   const props = editorStore.currentPage.getWidgetById(id)
//     .finalValues as WebloomChartProps;
//   return (
//     <ToolTipWrapper text={props.tooltip}>
//       <div className="relative h-full w-full">
//         <Chart
//           type={props.data.chartType}
//           options={{
//             responsive: true,
//             maintainAspectRatio: false,
//             // labeling
//             // @link https://www.chartjs.org/docs/latest/axes/labelling.html
//             scales: {
//               x: {
//                 title: {
//                   display: props.layout.xAxisName !== undefined,
//                   text: props.layout.xAxisName,
//                 },
//               },
//               y: {
//                 title: {
//                   display: props.layout.yAxisName !== undefined,
//                   text: props.layout.yAxisName,
//                 },
//               },
//             },
//             plugins: {
//               /**
//                * @link https://www.chartjs.org/docs/latest/configuration/legend.html#configuration-options
//                */
//               legend: {
//                 display: props.layout.legendPosition !== 'none',
//                 position:
//                   props.layout.legendPosition === 'none'
//                     ? 'top'
//                     : props.layout.legendPosition,
//               },
//               // title configuration
//               // @link https://www.chartjs.org/docs/latest/configuration/title.html
//               title: {
//                 display: props.layout.title !== undefined,
//                 text: props.layout.title,
//                 font: {
//                   size: 18,
//                 },
//               },
//             },
//           }}
//           data={{
//             // x-axis-value
//             labels: [
//               ...new Set(
//                 props.data.dataSource.map((row) => row[props.data.xAxisValue]),
//               ),
//             ],
//             datasets: props.data.datasets.map((ds) => ({
//               type: ds.chartType,
//               label: ds.name,
//               data: calculateAggregation(
//                 props.data.dataSource,
//                 props.data.xAxisValue,
//                 ds.yValue,
//                 ds.aggMethod,
//               ),
//               backgroundColor: ds.color,
//             })),
//           }}
//         />
//       </div>
//     </ToolTipWrapper>
//   );
// });

// const config: WidgetConfig = {
//   name: 'Charts',
//   icon: <BarChartBig />,
//   isCanvas: false,
//   layoutConfig: {
//     colsCount: 10,
//     rowsCount: 30,
//     minColumns: 1,
//     minRows: 4,
//   },
//   resizingDirection: 'Both',
// };

// const defaultProps: WebloomChartProps = {
//   data: {
//     dataSource: [
//       { year: 2010, count: 10 },
//       { year: 2011, count: 20 },
//       { year: 2012, count: 15 },
//       { year: 2013, count: 25 },
//       { year: 2014, count: 22 },
//       { year: 2015, count: 30 },
//       { year: 2016, count: 28 },
//     ],
//     datasets: [
//       {
//         name: 'dataset 1',
//         yValue: 'count',
//         aggMethod: 'sum',
//         chartType: 'bar',
//         color: '#165DFF',
//       },
//     ],
//     chartType: 'bar',
//     // direction: 'vertical',
//     xAxisValue: 'year',
//   },
//   tooltip: '',
//   layout: {
//     legendPosition: 'top',
//     xAxisType: 'default',
//   },
// };

// // const schema: WidgetInspectorConfig = {
// //   dataSchema: zodToJsonSchema(webloomChartProps),
// //   uiSchema: {
// //     data: {
// //       dataSource: {
// //         'ui:widget': 'inlineCodeInput',
// //       },
// //       datasets: {
// //         items: {
// //           'ui:options': {
// //             'ui:itemType': ArrayFieldItemType.ChartItem,
// //           },
// //           name: {
// //             'ui:widget': 'inlineCodeInput',
// //           },
// //           // TODO: use custom component
// //           yValue: {
// //             'ui:label': 'Dataset values',
// //           },
// //           color: {
// //             'ui:widget': 'colorPicker',
// //           },
// //         },
// //       },
// //       xAxisValue: {
// //         'ui:widget': 'chartDynamicXValue',
// //       },
// //     },
// //   },
// // };

// const WebloomChartWidget: Widget<WebloomChartProps> = {
//   component: WebloomChart,
//   config,
//   defaultProps,
// };

// export { WebloomChartWidget };
