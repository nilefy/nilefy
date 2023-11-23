import { SignInSchema, UserI } from '@/types/auth.types';
import { fetchX } from '@/utils/fetch';

export interface User {
  accessToken: string;
  user: UserI;
}
export interface UserData {
  access_token: string;
}

export const signIn = async (user: SignInSchema): Promise<UserData> => {
  const response = await fetchX('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data as UserData;
};

export const signOut = async () => {
  try {
    // You can send a request to the server to invalidate the user session , like blacklisting this token  (or we can just remove the token from local storage for now)
    const response = await fetchX('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle any errors
    console.error('Sign-out failed:', error);
  }
};
