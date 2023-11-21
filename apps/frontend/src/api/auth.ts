import { fetchX } from '@/utils/fetch';

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

export const signIn = async (user: LoginCredentials): Promise<UserData> => {
  const response = await fetchX('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
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

export async function getUser(
  user: User | null | undefined,
): Promise<User | null> {
  if (!user) return null;
  // const [header, payload, signature] = user.accessToken.split('.');

  // const decodedPayload = JSON.parse(atob(payload));
  // console.log('Decoded Payload:', decodedPayload);

  // const { sub, username } = decodedPayload;
  //
  // const response = await fetch(`/api/users/${user.user.id}`, {
  // headers: {
  // Authorization: `Bearer ${user.accessToken}`,
  // },
  // });
  // if (!response.ok) throw new Error('Failed on get user request');
  //
  // return await response.json();
  return Promise.resolve({
    accessToken: user.accessToken,
    user: {
      username: 'gngn',
      id: 1,
    },
  });
}
