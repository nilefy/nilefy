// import React from 'react';

// function ForgotPassword() {
//   return (
//     <div>
//       <h2>Reset your password</h2>
//       <p>
//         Enter your email address or username, and we&rsquo;ll send you a link to
//         get back into your account.
//       </p>
//       <div>
//         <label htmlFor="emailOrUsername">Email address or username</label>
//         <input type="text" id="emailOrUsername" name="emailOrUsername" />
//       </div>
//       <div>
//         <a href="/support">Need support?</a>
//       </div>
//       <div>
//         <p>This site is protected by reCAPTCHA and the Google</p>
//         <p>Privacy Policy and Terms of Service apply.</p>
//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { SignInSchema, signInSchema } from '@/types/auth.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
    },
  });
  function onSubmit() {
    // Add your submit logic here
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Forgot Password</h1>
      <p>
        Remembered your password?{' '}
        <Link className="text-blue-500" to={'/signin'}>
          Sign In
        </Link>
      </p>
      <div>
        <Link
          // Add your forgot password link here
          to={'/need_help_in'}
          className="text-blue-500 underline"
        >
          Need help signing in?
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
