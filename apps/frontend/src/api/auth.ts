import { fetchX } from '@/utils/fetch';
import * as z from 'zod';

export const signUpSchema = z
  .object({
    username: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(5),
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords don't match",
    path: ['password'], // path of error
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface User {
  accessToken: string;
  user: {
    username: string;
    id: number;
  };
}
export interface UserData {
  access_token: string;
}
export const signUp = async (user: SignUpSchema): Promise<UserData> => {
  const response = await fetchX('auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
};
export const signIn = async (user: LoginCredentials): Promise<UserData> => {
  const response = await fetchX('auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
};
