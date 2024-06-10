import { signUp } from '@/api/auth.api';
import { FetchXError } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export function useSignUp() {
  const navigate = useNavigate();
  const signUpMuation = useMutation<
    Awaited<ReturnType<typeof signUp>>,
    FetchXError,
    Parameters<typeof signUp>[0]
  >({
    mutationFn: signUp,
    onSuccess: async (data) => {
      navigate({ pathname: '/signin', search: `msg=${data.msg}` });
    },
  });
  return signUpMuation;
}
