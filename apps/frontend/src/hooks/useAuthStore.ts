import { create } from 'zustand';
import { JwtPayload, UserI } from '@/types/auth.types';
import { getToken, saveToken } from '@/lib/token.localstorage';
import { jwtDecode } from 'jwt-decode';

type Token = string;
type AuthStore = {
  user: UserI | null;
  token: Token | null;
  isLoading: boolean;
  isAuth: boolean;
  setUser: (user: UserI) => void;
  setToken: (token: Token) => void;
};

function getUser(): AuthStore['user'] {
  const token = getToken();
  if (token) {
    const decoded = jwtDecode(token) as JwtPayload;
    console.log(
      '🪵 [useAuthStore.ts:19] ~ token ~ \x1b[0;32mdecoded\x1b[0m = ',
      decoded,
    );
    return {
      id: decoded.sub,
      username: decoded.username,
    };
  }
  return null;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: getUser(),
  token: getToken(),
  isLoading: false,
  isAuth: false,
  setUser: (newUser: UserI) => {
    // save in local storage and store
    set({ user: newUser });
  },
  setToken: (newToken: Token) => {
    set({ token: newToken });
    saveToken(newToken);
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

export { useAuthStore };
