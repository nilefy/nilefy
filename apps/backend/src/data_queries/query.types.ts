import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const queryRetSchema = z.object({
  statusCode: z
    .number()
    .describe(
      'the status code returned from the other backend or 505 from our server',
    ),
  data: z
    .unknown()
    .describe('the data returned from the other backend,could be any type'),
  error: z.string().optional().describe('the error message'),
});
export class QueryRet extends createZodDto(queryRetSchema) {}

export type QueryConfig<T = Record<string, unknown>> = {
  /**
   * name of the query being run
   */
  name: string;
  /**
   * **evaluated** query configuration
   */
  query: T;
};
