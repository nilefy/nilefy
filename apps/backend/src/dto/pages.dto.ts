import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { pages as pagesDrizzle } from '../drizzle/schema/appsState.schema';

export const pageSchema = createSelectSchema(pagesDrizzle);

export const createPageDb = createInsertSchema(pagesDrizzle, {
  name: (schema) => schema.name.min(1).max(255),
  index: (schema) => schema.index.min(1),
});

export const createPageSchema = createPageDb.pick({
  name: true,
});

export const updatePageDb = createPageDb
  .partial()
  // don't let the user update the appId
  .omit({ appId: true })
  .extend({
    updatedById: z.number(),
  });

export const updatePageSchema = createPageDb
  .pick({
    name: true,
    visible: true,
    handle: true,
    enabled: true,
    index: true,
  })
  .partial();

export type PageDto = z.infer<typeof pageSchema>;
/**
 * insert in the db interface
 */
export type CreatePageDb = z.infer<typeof createPageDb>;
/**
 * API insert interface
 */
export type CreatePageDto = z.infer<typeof createPageSchema>;
export type UpdatePageDb = z.infer<typeof updatePageDb>;
export type UpdatePageDto = z.infer<typeof updatePageSchema>;