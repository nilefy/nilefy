import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { useNavigate } from 'react-router-dom';
export function useSignOut() {
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();
  const signOutMutation = useMutation({
    onSuccess: () => {
      setUser(null);
      setToken(null);
      navigate('/signin');
    },
    onError: (error) => {
      console.error('Sign-out failed:', error);
    },
  });

  return signOutMutation;
}
