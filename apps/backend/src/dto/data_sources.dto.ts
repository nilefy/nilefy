import { z } from 'zod';
import {
  dataSources,
  workspaceDataSources,
} from '../drizzle/schema/data_sources.schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const workspaceDataSourcesSelect = createSelectSchema(
  workspaceDataSources,
  {
    name: z.string().min(1).max(100),
    config: z.record(z.string(), z.any()),
  },
);
export const workspaceDataSourcesInsert = createInsertSchema(
  workspaceDataSources,
  {
    name: z.string().min(1).max(100),
    config: z.record(z.string(), z.any()),
  },
);
export const createWsDataSourceSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.any()),
});
export const updateWsDataSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export const dataSourceSelect = createSelectSchema(dataSources);
export const dataSourcesInsert = createInsertSchema(dataSources);

export type WsDataSourceDto = z.infer<typeof workspaceDataSourcesSelect>;
export type CreateWsDataSourceDb = z.infer<typeof workspaceDataSourcesInsert>;
export type CreateWsDataSourceDto = z.infer<typeof createWsDataSourceSchema>;
export type UpdateWsDataSourceDto = z.infer<typeof updateWsDataSourceSchema>;
export type WsDataSourceP = Partial<WsDataSourceDto> & {
  dataSource: DataSourceP;
};

export type DataSourceDto = z.infer<typeof dataSourceSelect>;
export type DataSourceDb = z.infer<typeof dataSourcesInsert>;
export type DataSourceP = Partial<DataSourceDto>;

export type DataSourceConfigT = Record<string, unknown>;
