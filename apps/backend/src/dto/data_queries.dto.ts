import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '../drizzle/schema/data_sources.schema';
import { z } from 'zod';

export const querySchema = createSelectSchema(queries);
export const queryDb = createInsertSchema(queries, {
  name: (schema) => schema.name.min(1).max(100),
  query: (schema) => schema.query.min(1).max(255),
});

export const addQuerySchema = queryDb.pick({
  name: true,
  query: true,
});

export type AddQueryDto = z.infer<typeof addQuerySchema>;
export type QueryDto = z.infer<typeof querySchema>;
export type QueryDb = z.infer<typeof queryDb>;
