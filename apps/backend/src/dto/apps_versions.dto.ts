import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { appsVersions } from '@nilefy/database';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const appVersionSchema = createSelectSchema(appsVersions);
export class AppVersionDto extends createZodDto(appVersionSchema) {}

export const createAppVersionDb = createInsertSchema(appsVersions, {
  name: (schema) => schema.name.min(1).max(100),
});
export type CreateAppVersionDb = z.infer<typeof createAppVersionDb>;

export const createAppVersionSchema = createAppVersionDb
  .pick({
    name: true,
  })
  .extend({
    // null = v1
    versionFromId: z.string().nullable(),
  });
export class CreateAppVersionDto extends createZodDto(createAppVersionSchema) {}

