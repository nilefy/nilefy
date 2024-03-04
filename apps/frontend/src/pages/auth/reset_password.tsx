import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
// import { resetPasswordSchema } from '@/types/auth.types';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
// import { useResetPassword } from '@/hooks/useResetPassword';
import { useToast } from '@/components/ui/use-toast';

export function ResetPassword() {
  const { toast } = useToast();
  const form = useForm({
    // resolver: zodResolver(resetPasswordSchema),
  });
  // const { mutate, isLoading, isSuccess } = useResetPassword();

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

  function onsubmit() {}
  console.log('hi');
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Reset Password</h1>
      <Form {...form}>
        {/* <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> */}
        <form onSubmit={onSubmit} className="space-y-8">
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
          <Button type="submit" disabled={isLoading || isSuccess}>
            Reset Password
          </Button>
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
