import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '../drizzle/schema/data_sources.schema';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const querySchema = createSelectSchema(queries).extend({
  query: z.record(z.string(), z.unknown()),
});

export const queryDb = createInsertSchema(queries, {
  name: (schema) => schema.name.min(1).max(100),
}).extend({
  query: z.record(z.string(), z.unknown()),
});

export const addQuerySchema = queryDb.pick({
  dataSourceId: true,
  name: true,
  query: true,
});

export const updateQuerySchema = addQuerySchema.partial();

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
