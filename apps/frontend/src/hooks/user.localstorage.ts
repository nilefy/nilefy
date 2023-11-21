// const USER_LOCAL_STORAGE_KEY = 'WEB-LOOM-USER';

const USER_LOCAL_STORAGE_KEY = 'user';

const TOKEN_KEY = 'access_token';

type User = {
  username: string;
  id: number;
};

export function saveUser(user: User): void {
  localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
}

export function getUser(): User | undefined {
  const user = localStorage.getItem(USER_LOCAL_STORAGE_KEY);

  return user ? JSON.parse(user) : undefined;
}

export function removeUser(): void {
  localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
}

export const saveToken = async (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  console.log('saved token');
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
