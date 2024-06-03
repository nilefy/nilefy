import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '@nilefy/database';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  dataSourceSelect,
  workspaceDataSourcesSelect,
} from './data_sources.dto';

export const querySchema = createSelectSchema(queries).extend({
  query: z.record(z.string(), z.unknown()),
});

export const queryDb = createInsertSchema(queries).extend({
  query: z.record(z.string(), z.unknown()),
});

export const addQuerySchema = queryDb
  .pick({
    id: true,
    query: true,
    triggerMode: true,
  })
  .extend({
    dataSourceId: z.number(),
  });

export const updateQuerySchema = addQuerySchema.partial().extend({
  dataSourceId: z.number().nullable(),
});

export const runQueryBody = z.object({
  evaluatedConfig: z.record(z.string(), z.unknown()),
});

// export type RunQueryBody = z.infer<typeof runQueryBody>;
// export type AddQueryDto = z.infer<typeof addQuerySchema>;
// export type UpdateQueryDto = z.infer<typeof updateQuerySchema>;
// export type QueryDto = z.infer<typeof querySchema>;
export type QueryDb = z.infer<typeof queryDb>;

export class RunQueryBody extends createZodDto(runQueryBody) {}
export class AddQueryDto extends createZodDto(addQuerySchema) {}
export class UpdateQueryDto extends createZodDto(updateQuerySchema) {}
export class QueryDto extends createZodDto(querySchema) {}

export const deleteDatasourceQueriesSchema = z.object({
  dataSourceId: z.number(),
});
export class DeleteDatasourceQueriesDto extends createZodDto(
  deleteDatasourceQueriesSchema,
) {}

export const appQuerySchema = querySchema
  .pick({
    id: true,
    query: true,
    triggerMode: true,
    dataSourceId: true,
  })
  .extend({
    baseDataSource: dataSourceSelect
      .pick({
        id: true,
        type: true,
        name: true,
        queryConfig: true,
      })
      .extend({
        queryConfig: z.object({
          schema: z.record(z.string(), z.unknown()),
          uiSchema: z.record(z.string(), z.unknown()).optional(),
        }),
      }),
    dataSource: workspaceDataSourcesSelect
      .pick({
        id: true,
        name: true,
      })
      .optional(),
  });
export const appQueriesSchema = z.array(appQuerySchema);

export class AppQueryDto extends createZodDto(appQuerySchema) {}
export class AppQueriesDto extends createZodDto(appQueriesSchema) {}
