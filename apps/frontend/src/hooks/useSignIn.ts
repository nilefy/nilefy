// Import dependencies
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LoginCredentials, signIn } from '@/api/auth';
import { useAuthStore } from './useAuthStore';
// Define types
// import { useAuth } from '@/providers/AuthProvider';
export const QUERY_KEY = {
  webloom: 'webloom',
  user: 'user',
};
export function useSignIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const { mutateAsync: signInMuation } = useMutation({
    mutationFn: (creds: LoginCredentials) => signIn(creds),
    onMutate: async () => {
      useAuthStore.setState({ isLoading: true });
    },
    onSuccess: async (data) => {
      await queryClient.setQueryData(['access_token'], data.access_token);
      setToken(data.access_token);
      // Decode the token
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const parts = JSON.parse(atob(base64));

      //Access the user data
      const userData = {
        username: parts.username,
        id: parts.sub,
      };
      //Store user information in the React Query
      await queryClient.setQueryData(['user'], userData);
      //Save user information in local storage
      setUser(userData);
      navigate('/');
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: () => {
      useAuthStore.setState({ isLoading: false });
      console.log(useAuthStore.getState());
    },
  });
  return signInMuation;
}
