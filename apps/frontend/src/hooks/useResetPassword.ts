import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPassword as resetPassword } from '@/api/auth';
import { FetchXError } from '@/utils/fetch';
import { ResetPasswordSchema } from '@/types/auth.types';

export function useResetPassword() {
  const navigate = useNavigate();
  const resetPasswordMutation = useMutation<
    void,
    FetchXError,
    ResetPasswordSchema
  >({
    mutationFn: (values: ResetPasswordSchema) => resetPassword(values),
    onSuccess: async () => {
      navigate('/password-reset-instructions');
    },
  });
  return resetPasswordMutation;
}
