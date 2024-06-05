import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { workspaces as workspacesDrizzle } from '@nilefy/database';
import { createZodDto } from 'nestjs-zod';

export const workspaceSchema = createSelectSchema(workspacesDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
  imageUrl: (schema) => schema.imageUrl.url(),
});

/**
 * the schema the db require to create workspace
 * but we don't give the user the ability to change all these fields
 *
 * for example: i don't want the front to send reqeust that have `deletedAt` and accept it
 *
 * so i will create another schema with the fields front(API user) can provide at creation
 */
export const createWorkspaceDb = createInsertSchema(workspacesDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
  imageUrl: (schema) => schema.imageUrl.url(),
});

/**
 * schema of the fields API user can control while inserting new workspace
 */
export const createWorkspaceSchema = createWorkspaceDb.pick({
  name: true,
  imageUrl: true,
});

export const updateWorkspaceDb = createWorkspaceDb.partial().extend({
  updatedById: z.number(),
});
export const updateWorkspaceSchema = createWorkspaceSchema.partial();

// export type WorkspaceDto = z.infer<typeof workspaceSchema>;
export class WorkspaceDto extends createZodDto(workspaceSchema) {}
export type CreateWorkspaceDb = z.infer<typeof createWorkspaceDb>;
// export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
// export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}
export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
export type UpdateWorkspaceDb = z.infer<typeof updateWorkspaceDb>;
