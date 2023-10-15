import { ModeToggle } from '@/components/mode-toggle';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Wind, Layout, Cog } from 'lucide-react';

const dashboardPaths = [
  {
    name: 'apps',
    path: '',
    icon: <Layout size={30} />,
  },
  {
    name: 'workspaceSettings',
    path: 'workspace-settings',
    icon: <Cog size={30} />,
  },
];

export function Dashboard() {
  const { workspaceId } = useParams();

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
        <div className="mt-auto flex flex-col">
          <ModeToggle />
        </div>
      </div>

      <Outlet />
    </div>
  );
}
