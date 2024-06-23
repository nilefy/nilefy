import { api } from '@/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3),
  // TODO: enable change email
  // email: z.string().email(),
});
type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

function EditProfile() {
  const { toast } = useToast();
  const { mutate } = api.users.updateCurrentUser.useMutation({
    onSuccess() {
      toast({
        variant: 'default',
        title: 'Updated Profile Successfully ✅',
      });
    },
  });
  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: '',
      // TODO: enable change email
      // email: '',
    },
  });
  function onSubmit(values: UpdateProfileSchema) {
    mutate({
      username: values.username,
    });
  }

  return (
    <Card className="w-4/6">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Edit your profile metadata</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-wrap justify-between gap-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormLabel>username</FormLabel>
                    <FormControl>
                      <Input placeholder="fullname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nagy@loom.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              {/* <FormItem className="w-2/5">
                <FormLabel>Avatar</FormLabel>
                <Input type="file" />
              </FormItem> */}
            </div>
            <Button type="submit">Update</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export const updatePasswordSchema = z
  .object({
    password: z.string().min(5),
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords don't match",
    path: ['password'], // path of error
  });

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

function EditPassword() {
  const { toast } = useToast();
  const { mutate } = api.users.updateCurrentUser.useMutation({
    onSuccess() {
      toast({
        variant: 'default',
        title: 'Updated Password Successfully ✅',
      });
    },
  });
  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      rePassword: '',
    },
  });
  function onSubmit(values: UpdatePasswordSchema) {
    mutate({
      password: values.password,
    });
  }

  return (
    <Card className="w-4/6">
      <CardHeader>
        <CardTitle>Edit Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            <Button type="submit">Update Password</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ProfileSettings() {
  return (
    <div className="bg-primary/5 flex h-full w-full flex-col items-center justify-center gap-5 overflow-y-auto">
      {/*edit profile [name/email/photo]*/}
      <EditProfile />
      {/*edit password*/}
      <EditPassword />
    </div>
  );
}
