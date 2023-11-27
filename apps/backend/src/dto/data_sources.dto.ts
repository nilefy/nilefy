import { z } from 'zod';
import {
  dataSources,
  workspaceDataSources,
} from '../drizzle/schema/data_sources.schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const workspaceDataSourcesSelect =
  createSelectSchema(workspaceDataSources);
export const workspaceDataSourcesInsert =
  createInsertSchema(workspaceDataSources);
export const createWsDataSourceSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.string()),
});

export const dataSourceSelect = createSelectSchema(dataSources);
export const dataSourcesInsert = createInsertSchema(dataSources);

export type WsDataSourceDto = z.infer<typeof workspaceDataSourcesSelect>;
export type CreateWsDataSourceDb = z.infer<typeof workspaceDataSourcesInsert>;
export type CreateWsDataSourceDto = z.infer<typeof createWsDataSourceSchema>;

export type DataSourceDto = z.infer<typeof dataSourceSelect>;
export type DataSourceDb = z.infer<typeof dataSourcesInsert>;

export type DataSourceConfigT = Record<string, any>;
