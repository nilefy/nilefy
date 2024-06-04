import { JwtPayload, UserI } from '@/types/auth.types';
import { getToken, removeToken, saveToken } from '@/lib/token.localstorage';
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
    try {
      const decoded = jwtDecode(token) as JwtPayload;
      if (decoded.exp * 1000 < Date.now()) {
        return null;
      }
      return {
        id: decoded.sub,
        username: decoded.username,
      };
    } catch (e) {
      removeToken();
      return null;
    }
  }
  return null;
}

export const useAuthStore = () => {
  const USER_QUERY_KEY = 'user';
  const TOKEN_QUERY_KEY = 'access_token';
  // const ISLOADING_QUERY_KEY = 'is_loading';
  const queryClient = useQueryClient();
  // const isLoading = useQuery({
  //   queryKey: [ISLOADING_QUERY_KEY],
  //   initialData: false,
  // });
  const user = useQuery({
    queryKey: [USER_QUERY_KEY],
    initialData: getUser(),
  });
  const token = useQuery({
    queryKey: [TOKEN_QUERY_KEY],
    initialData: getToken(),
  });
  const isAuthed = user.data !== null && token.data !== null;
  const setUser = (user: UserI | null) => {
    queryClient.setQueryData([USER_QUERY_KEY], user);
  };
  const setToken = (token: Token | null) => {
    queryClient.setQueryData([TOKEN_QUERY_KEY], token);
    token ? saveToken(token) : removeToken();
  };
  // const setIsLoading = (isLoading: boolean) => {
  //   queryClient.setQueryData([ISLOADING_QUERY_KEY], isLoading);
  // };
  return { user, token, isAuthed, setUser, setToken };
};
