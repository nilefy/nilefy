import { z } from 'zod';

export const signUpSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userSchema = signUpSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export type CreateUserDto = z.infer<typeof signUpSchema>;
export type LoginUserDto = z.infer<typeof signInSchema>;
export type UserDto = z.infer<typeof userSchema>;
