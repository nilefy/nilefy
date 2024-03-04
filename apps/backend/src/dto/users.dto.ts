import z from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users as usersDrizzle } from '../drizzle/schema/schema';
import { createZodDto } from 'nestjs-zod';

export const userSchema = createSelectSchema(usersDrizzle);
export const userInsertSchema = createInsertSchema(usersDrizzle, {
  username: (schema) => schema.username.min(3).max(255),
  email: (schema) => schema.email.email(),
  passwordResetToken: (schema) => schema.passwordResetToken.max(255),
  password: (schema) => schema.password.min(6).max(255),
});

export const updateUserSchema = userInsertSchema
  .pick({
    username: true,
    password: true,
  })
  .partial();

export const signUpSchema = userInsertSchema
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({
    password: z.string().min(6).max(255),
  });

export const signInSchema = signUpSchema.pick({
  email: true,
  password: true,
});

// export type UserDto = z.infer<typeof userSchema>;
// export type CreateUserDto = z.infer<typeof signUpSchema>;
// export type LoginUserDto = z.infer<typeof signInSchema>;
// export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export class UserDto extends createZodDto(userSchema) {}
export class CreateUserDto extends createZodDto(signUpSchema) {}
export class LoginUserDto extends createZodDto(signInSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class UpdateUserDb extends createZodDto(userInsertSchema.partial()) {}

export const updateUserRetSchema = userSchema.pick({
  id: true,
  username: true,
  email: true,
  createdAt: true,
  updatedAt: true,
});
export class UpdateUserRetDto extends createZodDto(updateUserRetSchema) {}
