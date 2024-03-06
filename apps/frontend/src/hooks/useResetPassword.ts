import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FetchXError } from '@/utils/fetch';
import { ResetPasswordSchema } from '@/types/auth.types';
import { resetPassword } from '@/api/auth';

export function useResetPassword() {
  // const navigate = useNavigate();
  const resetPasswordMutation = useMutation<
    void,
    FetchXError,
    ResetPasswordSchema
  >({
    mutationFn: (values: ResetPasswordSchema) => {
      return resetPassword(values);
    },
    onSuccess: async () => {
      // navigate('/password-reset-instructions');
      // todo: show a message that the password has been reset
    },
  });
  return resetPasswordMutation;
}
