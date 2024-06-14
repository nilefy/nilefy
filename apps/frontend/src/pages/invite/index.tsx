import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { InvitationLoaderRetI } from './loader';
import { InvitationTokenPayload } from '@nilefy/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WebloomLoader } from '@/components/loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function ExistingUserInvite({
  tokenPayload,
}: {
  tokenPayload: InvitationTokenPayload;
}) {
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
          <Button className="w-full">Accept Invite</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function NewUserInvite({
  tokenPayload,
}: {
  tokenPayload: InvitationTokenPayload;
}) {
  return <div>new user</div>;
}

export function InviteView() {
  const data = useLoaderData();
  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={data.invitation}>
        {(invitation: InvitationLoaderRetI) => {
          switch (invitation.invitationState.userStatus) {
            case 'newUser':
              return <NewUserInvite tokenPayload={invitation.tokenPayload} />;
            case 'existingUser':
              return (
                <ExistingUserInvite tokenPayload={invitation.tokenPayload} />
              );
          }
        }}
      </Await>
    </Suspense>
  );
}
