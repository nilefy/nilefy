import { z } from 'zod';

export const chartDatasets = z
  .array(
    z.object({
      name: z.string().default(''),
      yValue: z.string(),
      /**
       *@link https://docs.retool.com/apps/web/guides/components/charts#transformation-types
       * @description none
       * @description count	Returns the quantity of items for each group.
       * @description sum	Returns the summation of all numeric values.
       * @description avg	Returns the average of all numeric values.
       * @description median	Returns the median of all numeric values.
       * @description mode	Returns the mode of all numeric values.
       * @description rms	Returns the rms of all numeric values.
       * @description stddev	Returns the standard deviation of all numeric values.
       * @description min	Returns the minimum numeric value for each group.
       * @description max	Returns the maximum numeric value for each group.
       * @description first	Returns the first numeric value for each group.
       * @description last	Returns the last numeric value for each group.
       */
      aggMethod: z.enum([
        'none',
        'count',
        'sum',
        'avg',
        'median',
        // 'mode',
        'rms',
        'stddev',
        'min',
        'max',
        'first',
        'last',
      ]),
      chartType: z.enum(['bar', 'line', 'scatter']),
      // TODO: make it auto generated from existing datasets
      color: z.string(),
    }),
  )
  .default([]);

export type ChartDatasetsT = z.infer<typeof chartDatasets>;

export const nilefyChartProps = z.object({
  dataSource: z.array(z.record(z.unknown())).default([]),
  chartType: z
    .enum(['bar', 'line', 'scatter' /**'pie', 'doughnut', 'radar'**/])
    .default('bar'),
  // direction: z.enum(['vertical', 'horizontal']),
  /**
   * which column user wants to be in x-axis
   * @note: y-axis data is configured through datasets
   */
  xAxisValue: z.string(),
  datasets: chartDatasets,
  tooltip: z.string().optional(),
  /**
   * @link https://www.chartjs.org/docs/latest/configuration/legend.html#position
   * @note none will remove the legend
   */
  legendPosition: z
    .enum(['top', 'left', 'bottom', 'right', 'none'])
    .default('top'),
  title: z.string().optional(),
  xAxisName: z.string().optional(),
  yAxisName: z.string().optional(),
  xAxisType: z.enum(['default', 'date']).default('default'),
});

export type NilefyChartProps = z.infer<typeof nilefyChartProps>;
