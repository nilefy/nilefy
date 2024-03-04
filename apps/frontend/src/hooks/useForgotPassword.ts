// Import dependencies
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '@/api/auth';
import { FetchXError } from '@/utils/fetch';

export function useForgotPassword() {
  const navigate = useNavigate();
  const forgotPasswordMutation = useMutation<void, FetchXError, string>({
    mutationFn: (email) => forgotPassword(email),
    onSuccess: async () => {
      navigate('/password-reset-instructions');
    },
  });
  return forgotPasswordMutation;
}
