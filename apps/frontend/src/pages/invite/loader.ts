import { checkInvitation } from '@/api/workspaces.api';
import { FetchXError } from '@/utils/fetch';
import { InvitationTokenPayload } from '@nilefy/constants';
import { jwtDecode } from 'jwt-decode';
import { defer } from 'react-router-dom';

async function loaderPromiseWrapper(token: string) {
  try {
    const invitationState = await checkInvitation({
      token,
    });
    const tokenPayload = jwtDecode<InvitationTokenPayload>(token);
    return {
      err: false,
      invitationState,
      tokenPayload,
    };
  } catch (err) {
    // TODO: re-enable for fine grained error handling
    // if (err instanceof FetchXError) {
    //   return {
    //     err: true,
    //     ...err,
    //   };
    // } else {
    //   throw err;
    // }
    console.warn('DEBUGPRINT[5]: loader.ts:27: err=', err);
    throw err;
  }
}

export async function InvitationLoader({
  request,
}: {
  params: Record<string, string | undefined>;
  request: Request;
}) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    throw new Error('token is requried');
  }
  return defer({
    invitation: loaderPromiseWrapper(token),
  });
}

export type InvitationLoaderRetI = Awaited<
  ReturnType<typeof loaderPromiseWrapper>
>;
