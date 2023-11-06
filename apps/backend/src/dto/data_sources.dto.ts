import { z } from 'zod';
import { availableDataSources, dataSources } from '../drizzle/schema/schema';
import { createInsertSchema } from 'drizzle-zod';

export const dataSourceSchema = createInsertSchema(dataSources);
export const createDataSourceSchema = z.object({
  config: z.record(z.string(), z.string()),
});
export const availableDataSourcesSchema =
  createInsertSchema(availableDataSources);

export type DataSourceDto = z.infer<typeof dataSourceSchema>;
export type CreateDataSourceDto = z.infer<typeof createDataSourceSchema>;
export type dataSourceT = z.infer<typeof availableDataSourcesSchema>;
