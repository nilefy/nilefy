import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { EmailConfirmationData, confirmEmail } from '@/api/auth';

export function EmailConfirmation() {
  const { email, token } = useParams();

  // const confirmEmail = async (email: string, token: string) => {
  //   try {
  //     // Make the API call to your backend to confirm the email
  //     const res = await fetchX(`/api/confirm-email/${email}/${token}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json;charset=utf-8',
  //       },
  //       body: JSON.stringify({ email, token }),
  //     });
  //     console.log(await res.json()); // Handle response as needed
  //   } catch (error) {
  //     console.error('Error confirming email:', error);
  //   }
  // };

  // // Check if user is authenticated and perform API call

  const emailConfigurationData: EmailConfirmationData = {
    email: email,
    jwt: token,
  };

  // if (isAuthed && email && token) {
  confirmEmail(emailConfigurationData);
  // }

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
