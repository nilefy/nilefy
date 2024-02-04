import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { users as usersDrizzle } from '../drizzle/schema/schema';

export const userSchema = createSelectSchema(usersDrizzle, {
  username: (schema) => schema.username.min(3).max(255),
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(6).max(255),
  conformationToken: (schema) => schema.conformationToken.max(255),
});

export const updateUserSchema = userSchema
  .pick({
    username: true,
    password: true,
  })
  .partial();

export const signUpSchema = userSchema.pick({
  username: true,
  email: true,
  password: true,
});

export const signInSchema = userSchema.pick({
  email: true,
  password: true,
});

export type UserDto = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof signUpSchema>;
export type LoginUserDto = z.infer<typeof signInSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
