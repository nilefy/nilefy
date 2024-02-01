import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apps as appsDrizzle } from '../drizzle/schema/schema';
import { createZodDto } from 'nestjs-zod';

export const appSchema = createSelectSchema(appsDrizzle);

export const createAppDb = createInsertSchema(appsDrizzle, {
  name: (schema) => schema.name.min(1).max(100),
});

export const createAppSchema = createAppDb.pick({
  name: true,
  description: true,
  state: true,
});

export const updateAppDb = createAppDb
  .partial()
  // we don't support move the app from workspace to another one right now if we want to support this feature this `omit` should be deleted
  .omit({ workspaceId: true })
  .extend({
    updatedById: z.number(),
  });

export const updateAppSchema = createAppSchema.partial();

// export type AppDto = z.infer<typeof appSchema>;
/**
 * insert in the db interface
 */
export type CreateAppDb = z.infer<typeof createAppDb>;
/**
 * API insert interface
 */
// export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDb = z.infer<typeof updateAppDb>;
// export type UpdateAppDto = z.infer<typeof updateAppSchema>;

export class AppDto extends createZodDto(appSchema) {}
export class CreateAppDto extends createZodDto(createAppSchema) {}
export class UpdateAppDto extends createZodDto(updateAppSchema) {}
