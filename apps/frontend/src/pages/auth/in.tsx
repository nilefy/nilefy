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
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { useSignIn } from '@/hooks/useSignIn';
import { SignInSchema, signInSchema } from '@/types/auth.types';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

export function SignIn() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const err = searchParams.get('errorMsg');
  const msg = searchParams.get('msg');
  const token = searchParams.get('token');
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      password: '',
      email: '',
    },
  });
  const { mutate, isError, error, isPending } = useSignIn();
  useEffect(() => {
    // assumed to be good message from the backend
    if (msg) {
      toast({
        variant: 'default',
        title: 'sign in',
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
        title: 'Error while auth',
        description: err,
      });
      return;
    }
  }, [err, toast, mutate, token]);
  function onSubmit(values: SignInSchema) {
    mutate(values);
  }

  return (
    <div className="flex h-screen w-screen  flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Sign In</h1>
      <p>
        New User?{' '}
        <Link className="text-blue-500" to={'/signup'}>
          Create an account
        </Link>
      </p>
      <div>
        <Link
          to={'/api/auth/login/google'}
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          continue with Google
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nagy@webloom.com"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>enter strong password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {isError && <p className="text-red-900">{error?.message}</p>}
          <Button type="submit" disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
