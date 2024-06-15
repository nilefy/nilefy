import { Link } from 'react-router-dom';

export function NeedHelpSigningIn() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Need Help Signing In?</h1>
      <p>
        No worries! We&rsquo;re here to help you get back into your account.
        <br />
        Please choose from the options below:
      </p>
      <div className="flex flex-col items-center justify-center gap-4">
        <Link
          to={'/forgot-password'}
          className="text-blue-500 underline hover:text-blue-600"
        >
          Forgot Your Password?
        </Link>
        <Link
          to={'#'} // Add your help center link here
          className="text-blue-500 underline hover:text-blue-600"
        >
          Visit Our Help Center
        </Link>
        <Link
          to={'#'} // Add your contact support link here
          className="text-blue-500 underline hover:text-blue-600"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
