import { WebloomChartProps } from './interface';

function calculateStandardDeviation(array: number[]): number | undefined {
  if (array.length === 0) {
    return undefined; // No standard deviation for an empty array
  }

  // Step 1: Calculate the mean (average) of the array
  const mean = array.reduce((sum, value) => sum + value, 0) / array.length;

  // Step 2: Calculate the sum of the squared differences between each value and the mean
  const squaredDifferencesSum = array.reduce(
    (sum, value) => sum + Math.pow(value - mean, 2),
    0,
  );

  // Step 3: Calculate the variance (average squared difference)
  const variance = squaredDifferencesSum / array.length;

  // Step 4: Take the square root of the variance to get the standard deviation
  const standardDeviation = Math.sqrt(variance);

  return standardDeviation;
}

function calculateRMS(array: number[]): number {
  // Step 1: Square each element of the array
  const squaredValues: number[] = array.map((value) => value * value);

  // Step 2: Calculate the mean (average) of the squared values
  const meanSquared: number =
    squaredValues.reduce((sum, value) => sum + value, 0) / squaredValues.length;

  // Step 3: Take the square root of the mean
  const rms: number = Math.sqrt(meanSquared);

  return rms;
}

function calculateMedian(array: number[]): number | undefined {
  if (array.length === 0) {
    return undefined; // No median for an empty array
  }

  // Sort the array in ascending order
  const sortedArray = array.slice().sort((a, b) => a - b);

  const middleIndex = Math.floor(sortedArray.length / 2);

  if (sortedArray.length % 2 === 0) {
    // If the array has an even length, calculate the average of the two middle values
    const middleValues = sortedArray.slice(middleIndex - 1, middleIndex + 1);
    return (middleValues[0] + middleValues[1]) / 2;
  } else {
    // If the array has an odd length, return the middle value
    return sortedArray[middleIndex];
  }
}

export function calculateAggregation(
  data: WebloomChartProps['dataSource'],
  xAxisValue: WebloomChartProps['xAxisValue'],
  yAxisValue: WebloomChartProps['datasets'][0]['yValue'],
  method: WebloomChartProps['datasets'][0]['aggMethod'],
): number[] {
  switch (method) {
    case 'none': {
      return data.map((d) => +(d[yAxisValue] as string | number) ?? 0);
    }
    case 'sum': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        hash[key] = (hash[key] ?? 0) + yValue;
      }
      return Object.values(hash);
    }
    case 'avg': {
      const hash: Record<string, { sum: number; count: number }> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        hash[key] = {
          sum: (hash[key]?.['sum'] ?? 0) + yValue,
          count: (hash[key]?.['count'] ?? 0) + 1,
        };
      }
      return Object.values(hash).map((v) => v.sum / v.count);
    }
    case 'rms': {
      const hash: Record<string, number[]> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        if (hash[key] === undefined) hash[key] = [];
        hash[key].push(yValue);
      }
      return Object.values(hash).map((v) => calculateRMS(v));
    }
    case 'min': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        hash[key] = Math.min(hash[key] ?? Infinity, yValue);
      }
      return Object.values(hash);
    }
    case 'max': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        hash[key] = Math.max(hash[key] ?? -Infinity, yValue);
      }
      return Object.values(hash);
    }
    // case 'mode': {
    //   const hash: Record<string, number[]> = {};
    //   for (const i of data) {
    //     const key = i[xAxisValue] as string;
    //     const yValue = +(i[yAxisValue] as number | string);
    //     if (hash[key] === undefined) hash[key] = [];
    //     hash[key].push(yValue);
    //   }
    //   return Object.values(hash).map((v) => calculateMode(v) ?? 0);
    // }
    case 'last': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        hash[key] = yValue;
      }
      return Object.values(hash);
    }
    case 'count': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        hash[key] = (hash[key] ?? 0) + 1;
      }
      return Object.values(hash);
    }
    case 'first': {
      const hash: Record<string, number> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        if (hash[key] === undefined) hash[key] = yValue;
      }
      return Object.values(hash);
    }
    case 'median': {
      const hash: Record<string, number[]> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        if (hash[key] === undefined) hash[key] = [];
        hash[key].push(yValue);
      }
      return Object.values(hash).map((v) => calculateMedian(v) ?? 0);
    }
    case 'stddev': {
      const hash: Record<string, number[]> = {};
      for (const i of data) {
        const key = i[xAxisValue] as string;
        const yValue = +(i[yAxisValue] as number | string);
        if (hash[key] === undefined) hash[key] = [];
        hash[key].push(yValue);
      }
      return Object.values(hash).map((v) => calculateStandardDeviation(v) ?? 0);
    }
    default:
      return data.map((d) => +(d[yAxisValue] as string | number) ?? 0);
  }
}
