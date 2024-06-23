import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { useSignIn } from '@/hooks/useSignIn';
import { SignInSchema, signInSchema } from '@/types/auth.types';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { LoadingButton } from '@/components/loadingButton';

export function SignIn() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const err = searchParams.get('errorMsg');
  const msg = searchParams.get('msg');
  const token = searchParams.get('token');
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { mutate, isError, error, isPending } = useSignIn();
  useEffect(() => {
    // assumed to be good message from the backend
    if (msg) {
      toast({
        variant: 'default',
        title: 'Sign in 📧',
        description: msg,
      });
      return;
    }
    // if token exist in the url that means the server redirect oauth with access token(is this secure tho?)
    if (token) {
      mutate({ accessToken: token });
      return;
    }
    // for now assume that this message is from the backend with something that happend during oauth
    if (err) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error ❌',
        description: err,
      });
      return;
    }
  }, [err, toast, mutate, token, msg]);
  function onSubmit(values: SignInSchema) {
    mutate(values);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-auto lg:w-2/6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Nilefy
          </CardTitle>
          <CardDescription className="text-center text-sm font-semibold">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@nilefy.com"
                          autoFocus={true}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to={'/forgot-password'}
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isError && <p className="text-destructive">{error?.message}</p>}
                <LoadingButton
                  isLoading={isPending}
                  type="submit"
                  className="w-full"
                >
                  Login
                </LoadingButton>
              </form>
            </Form>
            <Button variant="outline" className="w-full" asChild>
              <Link
                to={
                  import.meta.env.DEV
                    ? 'http://localhost:3000/api/auth/login/google'
                    : '/api/auth/login/google'
                }
              >
                Login with Google
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
