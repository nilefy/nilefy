import { z } from 'zod';
import { dataSources, workspaceDataSources } from '@webloom/database';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

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

// export type WsDataSourceDto = z.infer<typeof workspaceDataSourcesSelect>;
// export type CreateWsDataSourceDto = z.infer<typeof createWsDataSourceSchema>;
// export type UpdateWsDataSourceDto = z.infer<typeof updateWsDataSourceSchema>;
export class WsDataSourceDto extends createZodDto(workspaceDataSourcesSelect) {}
export class CreateWsDataSourceDto extends createZodDto(
  createWsDataSourceSchema,
) {}
export class UpdateWsDataSourceDto extends createZodDto(
  updateWsDataSourceSchema,
) {}
export type CreateWsDataSourceDb = z.infer<typeof workspaceDataSourcesInsert>;
export type WsDataSourceP = Partial<WsDataSourceDto> & {
  dataSource: DataSourceP;
};

// export type DataSourceDto = z.infer<typeof dataSourceSelect>;
export class DataSourceDto extends createZodDto(dataSourceSelect) {}
// export type DataSourceDb = z.infer<typeof dataSourcesInsert>;
export class DataSourceDb extends createZodDto(dataSourcesInsert) {}
export type DataSourceP = Partial<DataSourceDto>;

export type DataSourceConfigT = Record<string, unknown>;

export const dataSourceConnectionSchema = workspaceDataSourcesSelect
  .pick({
    id: true,
    name: true,
    workspaceId: true,
    config: true,
  })
  .extend({
    dataSource: dataSourceSelect
      .pick({
        id: true,
        type: true,
        name: true,
        config: true,
        image: true,
      })
      .extend({
        config: z.object({
          schema: z.record(z.string(), z.unknown()),
          uiSchema: z.record(z.string(), z.unknown()).optional(),
        }),
      }),
  });

export const wsDataSourcesSchema = workspaceDataSourcesSelect
  .pick({
    id: true,
    name: true,
    workspaceId: true,
  })
  .extend({
    dataSource: dataSourceSelect.pick({
      id: true,
      type: true,
      name: true,
      image: true,
    }),
  });
export class DataSourceConnectionDto extends createZodDto(
  dataSourceConnectionSchema,
) {}
export class WsDataSourcesDto extends createZodDto(wsDataSourcesSchema) {}
