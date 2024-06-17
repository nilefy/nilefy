import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Suspense, useCallback } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { InvitationLoaderRetI } from './loader';
import { InvitationTokenPayload } from '@nilefy/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NilefyLoader } from '@/components/loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import z from 'zod';
import { api } from '@/api';

const newUserFormSchema = z.object({
  password: z.string().min(6).max(50),
});
type NewUserFormSchema = z.infer<typeof newUserFormSchema>;

function ExistingUserInvite({
  tokenPayload,
  token,
}: {
  tokenPayload: InvitationTokenPayload;
  token: string;
}) {
  const { mutate } = api.workspaces.inviteCallback.useMutation();
  const onClickCallback = useCallback(() => {
    mutate({
      userStatus: 'existingUser',
      status: 'acceptted',
      token,
    });
  }, [mutate, token]);

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            Join <b>{tokenPayload.workspaceName}</b>
          </CardTitle>
          <CardDescription>
            you are invited to a workspace {tokenPayload.workspaceName}. accept
            the invite to join the workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled={true}
              value={tokenPayload.email}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onClickCallback} className="w-full">
            Accept Invite
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function NewUserInvite({
  tokenPayload,
  token,
}: {
  tokenPayload: InvitationTokenPayload;
  token: string;
}) {
  const { mutate } = api.workspaces.inviteCallback.useMutation();
  const form = useForm<NewUserFormSchema>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      password: '',
    },
  });

  function onSubmit(values: NewUserFormSchema) {
    mutate({
      userStatus: 'newUser',
      password: values.password,
      token,
    });
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            Join <b>{tokenPayload.workspaceName}</b>
          </CardTitle>
          <CardDescription>
            you are invited to a workspace {tokenPayload.workspaceName}. accept
            the invite to join the workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled={true}
                  value={tokenPayload.email}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Accept Invite</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export function InviteView() {
  const data = useLoaderData();
  return (
    <Suspense fallback={<NilefyLoader />}>
      <Await resolve={data.invitation}>
        {(invitation: InvitationLoaderRetI) => {
          switch (invitation.invitationState.userStatus) {
            case 'newUser':
              return (
                <NewUserInvite
                  token={invitation.token}
                  tokenPayload={invitation.tokenPayload}
                />
              );
            case 'existingUser':
              return (
                <ExistingUserInvite
                  token={invitation.token}
                  tokenPayload={invitation.tokenPayload}
                />
              );
          }
        }}
      </Await>
    </Suspense>
  );
}
