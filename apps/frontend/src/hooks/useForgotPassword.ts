import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '@/api/auth';
import { FetchXError } from '@/utils/fetch';
import { ForgotPasswordSchema } from '@/types/auth.types';

export function useForgotPassword() {
  const navigate = useNavigate();
  const forgotPasswordMutation = useMutation<
    void,
    FetchXError,
    ForgotPasswordSchema
  >({
    mutationFn: (values) => forgotPassword(values),
    onSuccess: async () => {
      navigate('/password-reset-instructions');
    },
  });
  return forgotPasswordMutation;
}
