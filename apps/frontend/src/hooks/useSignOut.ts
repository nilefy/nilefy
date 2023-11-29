import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { useNavigate } from 'react-router-dom';

export function useSignOut() {
  const { setUser, setToken } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signout = async () => {
    setUser(null);
    setToken(null);
    queryClient.clear();
  };
  const signOutMutation = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      navigate('/signin');
    },
    onError: (error) => {
      console.error('Sign-out failed:', error);
    },
  });

  return signOutMutation;
}
