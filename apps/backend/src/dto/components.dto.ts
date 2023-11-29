import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { components as componentsDrizzle } from '../drizzle/schema/appsState.schema';

export const componentSchema = createSelectSchema(componentsDrizzle);

export const createComponentDb = createInsertSchema(componentsDrizzle, {
  name: (schema) => schema.name.min(1).max(255),
});

export const updateComponentDb = createComponentDb
  .partial()
  // we don't support move the app from workspace to another one right now if we want to support this feature this `omit` should be deleted
  .omit({ pageId: true, id: true })
  .extend({
    updatedById: z.number(),
  });

export type ComponentDto = z.infer<typeof componentSchema>;
/**
 * insert in the db interface
 */
export type CreateComponentDb = z.infer<typeof createComponentDb>;
export type UpdateComponentDb = z.infer<typeof updateComponentDb>;
