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
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSignIn } from '@/hooks/useSignIn';
import { SignInSchema, signInSchema } from '@/types/auth.types';

export function SignIn() {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      password: '',
      email: '',
    },
  });
  const { mutate, isError, error, isPending } = useSignIn();

  function onSubmit(values: SignInSchema) {
    mutate(values);
  }
  return (
    <div className="flex h-screen w-screen  flex-col items-center justify-center gap-5">
      <h1 className="text-4xl">Create Account</h1>
      <p>
        New User?{' '}
        <Link className="text-blue-500" to={'/signup'}>
          Create an account
        </Link>
      </p>
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
