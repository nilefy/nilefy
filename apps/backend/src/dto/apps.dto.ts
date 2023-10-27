import { z } from 'zod';

export const createAppSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
});

export const updateAppSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
});

export const appSchema = createAppSchema.extend({
  id: z.number(),
  userId: z.number(),
  icon: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDto = z.infer<typeof updateAppSchema>;
export type AppDto = z.infer<typeof appSchema>;
