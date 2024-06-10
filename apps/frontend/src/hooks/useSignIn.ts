// Import dependencies
import { signIn } from '@/api/auth.api';
import { JwtPayload } from '@/types/auth.types';
import { FetchXError } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';

export function useSignIn() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const signInMuation = useMutation<
    Awaited<ReturnType<typeof signIn>>,
    FetchXError,
    | Parameters<typeof signIn>[0]
    | {
        /**
         * if access token was provided to the hook it won't try to call the backend and will call the onSuccess with this token
         */
        accessToken: string;
      }
  >({
    mutationFn: (creds) => {
      if ('accessToken' in creds) {
        return new Promise((r) => r({ access_token: creds.accessToken }));
      } else {
        return signIn(creds);
      }
    },
    onSuccess: async (data) => {
      setToken(data.access_token);
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(data.access_token);
      //Access the user data
      const userData = {
        username: decoded.username,
        id: decoded.sub,
      };
      //Store user information in React Query
      setUser(userData);
      navigate('/');
    },
  });
  return signInMuation;
}
