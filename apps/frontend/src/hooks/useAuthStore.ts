// // hooks/useAuthStore.ts
import { create } from 'zustand';
import { getToken, getUser, saveToken, saveUser } from './user.localstorage';

type User = {
  username: string;
  id: number;
};
type Token = string;
type AuthStore = {
  user: User | null;
  token: Token | null;
  isLoading: boolean;
  isAuth: boolean;
  setUser: (user: User) => void;
  setToken: (token: Token) => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  user: getUser() || null,
  token: getToken() || null,
  isLoading: false,
  isAuth: !!getToken(),
  setUser: (newUser: User) => {
    // save in local storage and store
    set({ user: newUser });
    saveUser(newUser);
  },
  setToken: (newToken: Token) => {
    set({ token: newToken });
    saveToken(newToken);
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export { useAuthStore };
