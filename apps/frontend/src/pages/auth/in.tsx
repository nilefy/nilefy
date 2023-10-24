import * as z from 'zod';
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
import { Link, useNavigate } from 'react-router-dom';

// TODO: move the schema to seprate package to make sharing between front/back easier
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInSchema = z.infer<typeof signInSchema>;

export function SignIn() {
  const navigate = useNavigate();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      password: '',
      email: '',
    },
  });
  function onSubmit(values: SignInSchema) {
    console.log(values);
    return navigate('/');
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
                  <Input placeholder="nagy@webloom.com" {...field} />
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
