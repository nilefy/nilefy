import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignUpSchema, signUpSchema } from '@/api/auth.api';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { useSignUp } from '@/hooks/useSignUp';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { LoadingButton } from '@/components/loadingButton';

export function SignUp() {
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      password: '',
      rePassword: '',
      email: '',
    },
  });
  const { mutate, isError, error, isPending } = useSignUp();
  function onSubmit(values: SignUpSchema) {
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
            Create your account
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@nilefy.com" {...field} />
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
                        <Input
                          type="password"
                          placeholder="Enter a strong password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rePassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                        />
                      </FormControl>
                      {/* <FormDescription>confirm password</FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isError && (
                  <p className="text-destructive">{error?.message}</p>
                )}
                <LoadingButton
                  className="w-full"
                  type="submit"
                  isLoading={isPending}
                >
                  Sign up
                </LoadingButton>
              </form>
            </Form>
            <Button variant="outline" className="w-full" asChild>
              <a
                href={
                  import.meta.env.DEV
                    ? 'http://localhost:3000/api/auth/login/google'
                    : '/api/auth/login/google'
                }
                className={buttonVariants({
                  variant: 'outline',
                })}
              >
                Sign up with Google
              </a>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to={'/signin'} className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
