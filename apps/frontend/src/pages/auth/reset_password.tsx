import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
// import { resetPasswordSchema } from '@/types/auth.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/types/auth.types';
import { useForgotPassword } from '@/hooks/useForgotPassword';

export function ResetPassword() {
  const { email, token } = useParams();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });
  // const { mutate, isLoading, isSuccess } = useForgotPassword();

  // const onSubmit = (data) => {
  //   mutate(data, {
  //     onSuccess: () => {
  //       toast({
  //         variant: 'success',
  //         title: 'Password Reset',
  //         description: 'Your password has been successfully reset.',
  //       });
  //     },
  //     onError: (error) => {
  //       toast({
  //         variant: 'error',
  //         title: 'Password Reset Failed',
  //         description:
  //           error.message || 'An error occurred while resetting your password.',
  //       });
  //     },
  //   });
  // };

  function onsubmit() {
    console.log('hi from reset pass');
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Reset your password</h1>
      <h4 className="  text-sm text-gray-300  ">
        Please enter your new password below.
      </h4>
      <Form {...form}>
        {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> */}
        <form onSubmit={onsubmit} className="space-y-8">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your new password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* <Button type="submit" disabled={isLoading || isSuccess}> */}
          <Button type="submit" className=" w-full ">
            Change Password
          </Button>

          <div>
            <Link
              // Add your forgot password link here
              to={'/need_help_in'}
              className=" text-grey-100 text-sm underline"
            >
              Need support?
            </Link>
          </div>
          <p>
            Remember your password?{' '}
            <Link className="text-blue-500" to="/signin">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
