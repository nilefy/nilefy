import { useMutation } from '@tanstack/react-query';
import { signOut } from '@/api/auth';
import { useAuthStore } from './useAuthStore';
import { removeToken, removeUser } from './user.localstorage';

export function useSignOut() {
  const { mutate: signOutMutation } = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      useAuthStore.setState({ user: null, token: null });
      removeToken();
      removeUser();
    },
    onError: (error) => {
      console.error('Sign-out failed:', error);
    },
  });

  return signOutMutation;
}
