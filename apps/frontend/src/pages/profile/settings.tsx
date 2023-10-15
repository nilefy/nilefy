import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  email: z.string().email(),
});
type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

function EditProfile() {
  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  function onSubmit(values: UpdateProfileSchema) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
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
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="nagy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-2/5">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="nabil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
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
              />
              <FormItem className="w-2/5">
                <FormLabel>Avatar</FormLabel>
                <Input type="file" />
              </FormItem>
            </div>
            <Button type="submit">Update</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// TODO: add re-passwod check
const updatePasswordSchema = z.object({
  password: z.string().min(3),
});

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

function EditPassword() {
  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
    },
  });
  function onSubmit(values: UpdatePasswordSchema) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <Input type="password" />
            </FormItem>

            <Button type="submit">Change Password</Button>
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
