import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { components as componentsDrizzle } from '../drizzle/schema/appsState.schema';

export const componentSchema = createSelectSchema(componentsDrizzle);

export const createComponentDb = createInsertSchema(componentsDrizzle, {
  name: (schema) => schema.name.min(1).max(255),
});

export type ComponentDto = z.infer<typeof componentSchema>;
/**
 * insert in the db interface
 */
export type CreateComponentDb = z.infer<typeof createComponentDb>;
