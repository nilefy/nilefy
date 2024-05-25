import { ModeToggle } from '@/components/mode-toggle';
import { NavLink, Outlet, redirect, useParams } from 'react-router-dom';
import { Wind, Layout, Cog, /*Table,*/ Braces, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatar';
import { fetchX } from '@/utils/fetch';
import { WorkSpaces } from '@/components/selectWorkspace';
import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
import { loaderAuth } from '@/utils/loaders';
import { LogoName } from '@/components/ui/logo';

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
  // {
  //   name: 'builtin-db',
  //   path: 'database',
  //   icon: <Table size={30} />,
  // },
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
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
    }
    const query = allWorkspacesQuery();
    // we cannot operate on the front without having the data of the workspaces so we are doing it in the loader without returning it as a promise
    const workspaces: WorkSpaces =
      queryClient.getQueryData<WorkSpaces>(['workspaces']) ??
      (await queryClient.fetchQuery(query));
    const urlPath = new URL(request.url).pathname;
    return urlPath === '/' ? redirect(`/${workspaces[0].id}`) : null;
  };

export function Dashboard() {
  const { mutate } = useSignOut();
  const { workspaceId } = useParams();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/*dashbaord nav*/}
      <div className="flex h-full w-max flex-col gap-5 p-3">
        <NavLink to="/">
          <LogoName />
        </NavLink>
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
      <div className="h-full max-h-full w-full max-w-full">
        <Outlet />
      </div>
    </div>
  );
}
