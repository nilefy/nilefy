import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signUp } from '@/api/auth';
import { FetchXError } from '@/utils/fetch';

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
