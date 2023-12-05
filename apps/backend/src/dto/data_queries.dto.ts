import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '../drizzle/schema/data_sources.schema';
import { z } from 'zod';

export const querySchema = createSelectSchema(queries);
export const queryDb = createInsertSchema(queries);

export const addQuerySchema = z.object({
  name: z.string().min(1).max(100),
  query: z.record(z.string(), z.any()),
});

export type AddQueryDto = z.infer<typeof addQuerySchema>;
export type QueryDto = z.infer<typeof querySchema>;
export type QueryDb = z.infer<typeof queryDb>;
