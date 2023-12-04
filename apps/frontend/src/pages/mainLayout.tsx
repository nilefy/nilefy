import { ModeToggle } from '@/components/mode-toggle';
import { NavLink, Outlet, redirect, useParams } from 'react-router-dom';
import { Wind, Layout, Cog, Table, Braces, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatar';
import { fetchX } from '@/utils/fetch';
import { WorkSpaces } from '@/components/selectWorkspace';
import { QueryClient } from '@tanstack/react-query';
import { Inspector } from '@/components/inspector';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
import { getToken, removeToken } from '@/lib/token.localstorage';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/auth.types';
const dashboardPaths = [
  {
    name: 'apps',
    path: '',
    icon: <Layout size={30} />,
  },
  {
    name: 'dataSources',
    path: 'datasources',
    icon: <Braces size={30} />,
  },

  {
    name: 'builtin-db',
    path: 'database',
    icon: <Table size={30} />,
  },
  {
    name: 'workspaceSettings',
    path: 'workspace-settings',
    icon: <Cog size={30} />,
  },
];

const allWorkspacesQuery = () => ({
  queryKey: ['workspaces'],
  queryFn: async () => {
    const res = await fetchX('workspaces');
    return (await res.json()) as WorkSpaces;
  },
});

/**
 * getting the workspaces data needs to be done ASAP so i'm doing it in the "root" route then any component under the tree could get it easily with
 *
 * `const { workspaces } = useRouteLoaderData('root');`
 */
export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: { request: Request }) => {
    // as this loader runs before react renders we need to check for token first
    const token = getToken();
    if (!token) {
      return redirect('/signin');
    } else {
      // check is the token still valid
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        removeToken();
        return redirect('/signin');
      }
      const query = allWorkspacesQuery();
      // we cannot operate on the front without having the data of the workspaces so we are doing it in the loader without returning it as a promise
      const workspaces: WorkSpaces =
        queryClient.getQueryData<WorkSpaces>(['workspaces']) ??
        (await queryClient.fetchQuery(query));
      const urlPath = new URL(request.url).pathname;
      return urlPath === '/' ? redirect(`/${workspaces[0].id}`) : null;
    }
  };

export function Dashboard() {
  const { mutate } = useSignOut();
  const { workspaceId } = useParams();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen w-screen">
      {/*dashbaord nav*/}
      <div className="flex h-full w-max flex-col gap-5 p-3">
        {/*TODO: LOGO*/}
        <NavLink to={`/${workspaceId}`}>
          <Wind size={30} />
        </NavLink>
        {/*paths*/}
        <div className=" flex flex-col gap-4">
          {dashboardPaths.map((path) => (
            <NavLink to={path.path} key={path.name}>
              {path.icon}
            </NavLink>
          ))}
        </div>
        {/**TODO: move to editor layout */}
        <Inspector />
        <div className="mt-auto flex flex-col gap-4">
          <ModeToggle />
          <NavLink to="profile-settings">
            <Avatar className="mr-2">
              {/* src={user.imageUrl} */}
              <AvatarImage />
              <AvatarFallback>
                {getInitials(user?.data?.username || '')}
              </AvatarFallback>
            </Avatar>
          </NavLink>
        </div>
        <Button variant={'ghost'} size={'icon'} onClick={() => mutate()}>
          <LogOut />
        </Button>
      </div>

      <Outlet />
    </div>
  );
}
