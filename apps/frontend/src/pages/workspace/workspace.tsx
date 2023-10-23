import { SelectWorkSpace, WorkSpaces } from '@/components/selectWorkspace';
import { fetchX } from '@/utils/fetch';
import { QueryClient } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';
import {
  Await,
  NavLink,
  Outlet,
  defer,
  useRouteLoaderData,
} from 'react-router-dom';

const workspacePaths = [
  {
    name: 'Users',
    path: '',
  },
  { name: 'Groups', path: 'groups' },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const allWorkspacesQuery = () => ({
  queryKey: ['workspaces'],
  queryFn: async () => {
    await sleep(1000);
    const res = await fetchX('/workspaces');
    return (await res.json()) as WorkSpaces;
  },
});

export const loader = (queryClient: QueryClient) => async () => {
  const query = allWorkspacesQuery();
  // ⬇️ return data or fetch it
  return defer({
    workspaces: queryClient.fetchQuery(query),
  });
};

export function WorkspaceSettingsLayout() {
  // const { data: workspaces } = useQuery(allWorkspacesQuery());
  // TODO: please ts hace some mercy
  const { workspaces } = useRouteLoaderData('root');

  return (
    <>
      {/*workspace settings sidebar*/}
      <div className="flex h-screen w-1/5 flex-col gap-5 bg-primary/5">
        <h2 className="ml-2 text-3xl">WorkSpace Settings</h2>
        <nav className="flex flex-col gap-3">
          {workspacePaths.map((path) => (
            <NavLink
              key={path.path}
              to={path.path}
              className={({ isActive }) => {
                return `p-3 ${isActive ? 'bg-primary/10' : ''}`;
              }}
            >
              {path.name}
            </NavLink>
          ))}
        </nav>
        <div className="w-full">
          <Suspense fallback={<Loader className="animate-spin" />}>
            <Await resolve={workspaces} errorElement={<div>Oops!</div>}>
              <SelectWorkSpace />
            </Await>
          </Suspense>
        </div>
      </div>
      {/*RENDER CHILD ROUTE*/}
      <Outlet />
    </>
  );
}
