// Import dependencies
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/api/auth';
import { useAuthStore } from './useAuthStore';
import { JwtPayload, SignInSchema } from '@/types/auth.types';
import { jwtDecode } from 'jwt-decode';
import { FetchXError } from '@/utils/fetch';

// Define types
// import { useAuth } from '@/providers/AuthProvider';
export const QUERY_KEY = {
  webloom: 'webloom',
  user: 'user',
};
export function useSignIn() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const signInMuation = useMutation<
    Awaited<ReturnType<typeof signIn>>,
    FetchXError,
    Parameters<typeof signIn>[0]
  >({
    mutationFn: (creds: SignInSchema) => signIn(creds),
    onSuccess: async (data) => {
      setToken(data.access_token);
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(data.access_token);
      //Access the user data
      const userData = {
        username: decoded.username,
        id: decoded.sub,
      };
      //Store user information in the React Query
      setUser(userData);
      navigate('/');
    },
  });
  return signInMuation;
}
