import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '../drizzle/schema/data_sources.schema';
import { z } from 'zod';

export const querySchema = createSelectSchema(queries).extend({
  query: z.record(z.string(), z.unknown()),
});

export const queryDb = createInsertSchema(queries).extend({
  query: z.record(z.string(), z.unknown()),
});

export const addQuerySchema = queryDb.pick({
  dataSourceId: true,
  id: true,
  query: true,
});

export const updateQuerySchema = addQuerySchema.partial();

export const runQueryBody = z.object({
  evaluatedConfig: z.record(z.string(), z.unknown()),
});
export type RunQueryBody = z.infer<typeof runQueryBody>;

export type AddQueryDto = z.infer<typeof addQuerySchema>;
export type UpdateQueryDto = z.infer<typeof updateQuerySchema>;
export type QueryDto = z.infer<typeof querySchema>;
export type QueryDb = z.infer<typeof queryDb>;
