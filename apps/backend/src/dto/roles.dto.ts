import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { roles as rolesDrizzle } from '@webloom/database';
import { createZodDto } from 'nestjs-zod';

export const rolesSchema = createSelectSchema(rolesDrizzle, {
  name: (schema) => schema.name.min(2).max(100),
  description: (schema) => schema.name.min(2).max(255),
});

export const createRoleDb = createInsertSchema(rolesDrizzle);

export const createRoleSchema = rolesSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    description: z.string().optional(),
  });

export const updateRoleSchema = createRoleSchema.partial();

export const updateRoleDb = createRoleDb
  .partial()
  // cannot change role workspace
  .omit({ workspaceId: true })
  .extend({
    updatedById: z.number(),
  });

// export type RolesDto = z.infer<typeof rolesSchema>;
// export type RoleInsertI = z.infer<typeof createRoleSchema>;
// export type RoleUpdateI = z.infer<typeof updateRoleSchema>;
export class RolesDto extends createZodDto(rolesSchema) {}
export class RoleInsertI extends createZodDto(createRoleSchema) {}
export class RoleUpdateI extends createZodDto(updateRoleSchema) {}
/**
 * insert in the db interface
 */
export type CreateRoleDb = z.infer<typeof createRoleDb>;
export type UpdateRoleDb = z.infer<typeof updateRoleDb>;
