import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apps as appsDrizzle } from '../drizzle/schema/schema';

export const appSchema = createSelectSchema(appsDrizzle);

export const createAppDb = createInsertSchema(appsDrizzle, {
  name: (schema) => schema.name.min(1).max(100),
});

export const createAppSchema = createAppDb.pick({
  name: true,
  description: true,
  state: true,
});

export const updateAppDb = createAppDb.partial().extend({
  updatedById: z.number(),
});
export const updateAppSchema = createAppSchema.partial();

export type AppDto = z.infer<typeof appSchema>;
export type CreateAppDb = z.infer<typeof createAppDb>;
export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDb = z.infer<typeof updateAppDb>;
export type UpdateAppDto = z.infer<typeof updateAppSchema>;
