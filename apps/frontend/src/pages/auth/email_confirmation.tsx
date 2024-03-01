import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { EmailConfirmationData, confirmEmail } from '@/api/confirm_email.api';

export function EmailConfirmation() {
  const { email, token } = useParams();

  const emailConfigurationData: EmailConfirmationData = {
    email: email,
    jwt: token,
  };

  confirmEmail(emailConfigurationData);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Email Confirmed</h1>
      <p>Your email has been successfully confirmed.</p>
      <p>
        You can now{' '}
        <Link className="text-blue-500" to={'/signin'}>
          sign in
        </Link>{' '}
        to your account.
      </p>
    </div>
  );
}
