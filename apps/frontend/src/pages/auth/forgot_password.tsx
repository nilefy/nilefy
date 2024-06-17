import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingButton } from '@/components/loadingButton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ForgotPasswordSchema, forgotPasswordSchema } from '@/types/auth.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api } from '@/api';

export function ForgotPassword() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate, isPending } = api.auth.forgetPassword.useMutation();

  function onSubmit(values: ForgotPasswordSchema) {
    mutate(values, {
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Password Reset',
          description:
            'Your password reset instructions have been sent to your email.',
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Password Reset Failed',
          description:
            'An error occurred while sending password reset instructions to your email.',
        });
      },
    });
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email below to send reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="test@nilefy.com"
                            autoFocus={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <LoadingButton
                    isLoading={isPending}
                    type="submit"
                    className="w-full"
                  >
                    Send reset link
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link to="/signin" className="underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
