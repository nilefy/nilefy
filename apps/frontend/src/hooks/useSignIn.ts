// Import dependencies
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/api/auth';
import { useAuthStore } from './useAuthStore';
import { JwtPayload, SignInSchema } from '@/types/auth.types';
import { jwtDecode } from 'jwt-decode';

// Define types
// import { useAuth } from '@/providers/AuthProvider';
export const QUERY_KEY = {
  webloom: 'webloom',
  user: 'user',
};
export function useSignIn() {
  const navigate = useNavigate();
  const { setUser, setToken, setIsLoading } = useAuthStore();
  const { mutateAsync: signInMuation } = useMutation({
    mutationFn: (creds: SignInSchema) => signIn(creds),
    onMutate: async () => {
      setIsLoading(true);
    },
    onSuccess: async (data) => {
      setToken(data.access_token);
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(data.access_token);
      console.log(
        '🪵 [useSignIn.ts:29] ~ token ~ \x1b[0;32mdecoded\x1b[0m = ',
        decoded,
      );
      //Access the user data
      const userData = {
        username: decoded.username,
        id: decoded.sub,
      };
      //Store user information in the React Query
      setUser(userData);
      navigate('/');
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  return signInMuation;
}
