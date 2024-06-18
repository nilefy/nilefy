import { ModeToggle } from '@/components/mode-toggle';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Wind, Layout, Cog, /*Table,*/ Braces, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatar';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
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
          {/* <ModeToggle /> */}
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
