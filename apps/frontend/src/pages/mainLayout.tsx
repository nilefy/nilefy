// import { ModeToggle } from '@/components/mode-toggle';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Layout, Cog, /*Table,*/ Braces, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatar';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
import { LogoName } from '@/components/ui/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const dashboardPaths = [
  {
    name: 'apps',
    path: '',
    icon: Layout,
  },
  {
    name: 'dataSources',
    path: 'datasources',
    icon: Braces,
  },
  // {
  //   name: 'builtin-db',
  //   path: 'database',
  //   icon: <Table size={30} />,
  // },
  {
    name: 'workspaceSettings',
    path: 'workspace-settings',
    icon: Cog,
  },
];

function MainLayoutSidebar() {
  const { workspaceId } = useParams();
  const { user } = useAuthStore();
  const { mutate } = useSignOut();

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <NavLink
            to={`/${workspaceId}`}
            key={'nilefyhome'}
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 md:h-8 md:w-8 md:text-base"
          >
            <LogoName />
            <span className="sr-only">Nilefy.TM</span>
          </NavLink>
          {dashboardPaths.map((path) => (
            <Tooltip key={path.name}>
              <TooltipTrigger asChild>
                <NavLink
                  to={path.path}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <path.icon className="h-5 w-5" />
                  <span className="sr-only">{path.name}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{path.name}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {/* <ModeToggle /> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="profile-settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Avatar className="mr-2">
                  {/* src={user.imageUrl} */}
                  <AvatarImage />
                  <AvatarFallback>
                    {getInitials(user?.data?.username || '')}
                  </AvatarFallback>
                </Avatar>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">User Settings</TooltipContent>
          </Tooltip>
          <Button variant={'ghost'} size={'icon'} onClick={() => mutate()}>
            <LogOut />
          </Button>
        </nav>
      </aside>
    </TooltipProvider>
  );
}

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full">
      {/*dashbaord nav*/}
      <MainLayoutSidebar />
      <div className="w-full sm:gap-4  sm:pl-14">
        <Outlet />
      </div>
    </div>
  );
}
