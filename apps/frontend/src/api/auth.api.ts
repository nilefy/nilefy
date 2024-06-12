import { ForgotPasswordSchema, ResetPasswordSchema } from '@/types/auth.types';
import { fetchX, FetchXError } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
export const signUp = async (user: SignUpSchema): Promise<{ msg: string }> => {
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

export const resetPassword = async (
  values: ResetPasswordSchema,
): Promise<void> => {
  const response = await fetchX('auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  return await response.json();
};

export const forgotPassword = async (
  values: ForgotPasswordSchema,
): Promise<void> => {
  const { email } = values;
  const response = await fetchX('auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return await response.json();
};

export function useForgotPassword() {
  const forgotPasswordMutation = useMutation<
    void,
    FetchXError,
    ForgotPasswordSchema
  >({
    mutationFn: (values) => forgotPassword(values),
  });
  return forgotPasswordMutation;
}

export function useResetPassword() {
  // const navigate = useNavigate();
  const resetPasswordMutation = useMutation<
    void,
    FetchXError,
    ResetPasswordSchema
  >({
    mutationFn: (values: ResetPasswordSchema) => resetPassword(values),
  });
  return resetPasswordMutation;
}