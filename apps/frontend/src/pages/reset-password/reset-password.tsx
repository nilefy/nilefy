import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email(),
});

function ResetPasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <header className="mb-8 text-3xl font-bold">Reset Password</header>
      <main className="w-96 rounded-md p-8 shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg " htmlFor="email">
                    Recover Your Account
                  </FormLabel>
                  <FormDescription>
                    Enter your email, and we'll send you a password reset link
                    to this email.
                  </FormDescription>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      {...field}
                      className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default ResetPasswordForm;
