import { z } from 'zod';
import {
  availableDataSources,
  dataSources,
} from '../drizzle/schema/data_sources.schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const dataSourceSelect = createSelectSchema(dataSources);
export const dataSourceInsert = createInsertSchema(dataSources);
export const createDataSourceSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.string()),
});

export const availableDataSourceSelect =
  createSelectSchema(availableDataSources);
export const availableDataSourcesInsert =
  createInsertSchema(availableDataSources);

export type DataSourceDto = z.infer<typeof dataSourceSelect>;
export type CreateDataSourceDb = z.infer<typeof dataSourceInsert>;
export type CreateDataSourceDto = z.infer<typeof createDataSourceSchema>;

export type dataSourceT = z.infer<typeof availableDataSourceSelect>;
export type dataSourceDb = z.infer<typeof availableDataSourcesInsert>;
