import { useForm } from 'react-hook-form';
import { Link, redirect, useNavigate, useParams } from 'react-router-dom';
// import { resetPasswordSchema } from '@/types/auth.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, resetPasswordSchema } from '@/types/auth.types';
import { useResetPassword } from '@/api/auth.api';
import { toast } from '@/components/ui/use-toast';
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
export const resetPasswordLoader = ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  const { token } = params;
  if (!token || isTokenExpired(token)) {
    return redirect(
      `../../signin?${new URLSearchParams({
        errorMsg: 'Invalid Reset Link',
      }).toString()}`,
      {},
    );
  }
  return null;
};

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
      token: token || '',
    },
  });
  const { mutate } = useResetPassword();
  const onSubmit = (data: ResetPasswordSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Password Reset',
          description: 'Your password has been successfully reset.',
        });
        navigate('/signin');
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Password Reset Failed',
          description:
            error.message || 'An error occurred while resetting your password.',
        });
      },
    });
  };
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Reset your password</h1>
      <h4 className="  text-sm text-gray-300  ">
        Please enter your new password below.
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* <form onSubmit={onSubmit} className="space-y-8"> */}
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Please Enter your new password"
                      autoFocus={true}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="password_confirmation"
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <Button type="submit" disabled={isLoadin••••g || isSuccess}> */}
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
