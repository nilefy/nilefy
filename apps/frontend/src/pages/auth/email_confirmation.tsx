import { Link } from 'react-router-dom';

// todo #1 hook this up on /auth/email_confirmation
// todo #2 change the baseurl in [emailSignUpService] accordingly
export function EmailConfirmation() {
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
