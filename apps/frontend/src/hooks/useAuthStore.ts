import { create } from 'zustand';
import { JwtPayload, UserI } from '@/types/auth.types';
import { getToken, saveToken } from '@/lib/token.localstorage';
import { jwtDecode } from 'jwt-decode';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

export const useAuthStore = () => {
  const USER_QUERY_KEY = 'user';
  const TOKEN_QUERY_KEY = 'access_token';
  const ISLOADING_QUERY_KEY = 'is_loading';
  const queryClient = useQueryClient();
  const isLoading = useQuery({
    queryKey: [ISLOADING_QUERY_KEY],
    initialData: false,
  });
  const user = useQuery({
    queryKey: [USER_QUERY_KEY],
    initialData: getUser(),
  });
  const token = useQuery({
    queryKey: [TOKEN_QUERY_KEY],
    initialData: getToken(),
  });
  const isAuthed = !!token.data;
  const setUser = (user: UserI) => {
    queryClient.setQueryData([USER_QUERY_KEY], user);
  };
  const setToken = (token: Token) => {
    queryClient.setQueryData([TOKEN_QUERY_KEY], token);
    saveToken(token);
  };
  const setIsLoading = (isLoading: boolean) => {
    queryClient.setQueryData([ISLOADING_QUERY_KEY], isLoading);
  };
  return { user, token, isLoading, isAuthed, setUser, setToken, setIsLoading };
};
