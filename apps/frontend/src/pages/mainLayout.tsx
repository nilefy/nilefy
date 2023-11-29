import { PageSelector } from '@/components/pageSelector';
import { Inspector } from '@/components/inspector';
import { ModeToggle } from '@/components/mode-toggle';
import { WorkSpaces } from '@/components/selectWorkspace';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useSignOut } from '@/hooks/useSignOut';
import { getInitials } from '@/utils/avatar';
import { fetchX } from '@/utils/fetch';
import { QueryClient } from '@tanstack/react-query';
import { Cog, Layout, Table, Wind } from 'lucide-react';
import { NavLink, Outlet, redirect, useParams } from 'react-router-dom';

const dashboardPaths = [
  {
    name: 'apps',
    path: '',
    icon: <Layout size={30} />,
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
    const query = allWorkspacesQuery();
    // we cannot operate on the front without having the data of the workspaces so we are doing it in the loader without returning it as a promise
    // why do i need this check? well i want to redirect the user to workspace the first time they visit the dashboard, not every time
    const t = queryClient.getQueryData<WorkSpaces>(['workspaces']);
    if (t === undefined) {
      const workspaces = await queryClient.fetchQuery(query);
      const urlPath = new URL(request.url).pathname;
      return urlPath === '/' ? redirect(`/${workspaces[0].id}`) : null;
    } else {
      return t;
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
        <PageSelector />
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
        <Button onClick={() => mutate()}>Logout</Button>
      </div>
      <Outlet />u
    </div>
  );
}
