import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(3).max(255),
  imageUrl: z.string().url().optional(),
});
export const updateWorkspaceSchema = createWorkspaceSchema.partial();

/**
 * i'm not creating this for validation only to have consistant in creating types
 * and we might use automated tool to produce this kind of schemas from the database schema
 */
export const workspaceSchema = createWorkspaceSchema.extend({
  id: z.number(),
  imageUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
export type WorkspaceDto = z.infer<typeof workspaceSchema>;
