import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { queries } from '../../drizzle/schema/data_sources.schema';
import { z } from 'zod';

export const querySchema = createSelectSchema(queries);
export const queryDb = createInsertSchema(queries);

export const runQuerySchema = queryDb.omit({
  workspaceId: true,
  appId: true,
  userId: true,
});

export type RunQueryDto = z.infer<typeof runQuerySchema>;
export type QueryDto = z.infer<typeof querySchema>;
export type QueryDb = z.infer<typeof queryDb>;
