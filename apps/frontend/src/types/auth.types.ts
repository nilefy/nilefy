import z from 'zod';

// TODO: move the schema to seprate package to make sharing between front/back easier
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type SignInSchema = z.infer<typeof signInSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type JwtPayload = {
  exp: number;
  iat: number;
  sub: number;
  username: string;
};
export type UserI = {
  username: string;
  id: number;
};
