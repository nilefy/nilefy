import {
  SelectWorkSpace,
  SelectWorkSpaceProps,
} from '@/components/selectWorkspace';
import { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const workspacePaths = [
  {
    name: 'Users',
    path: '',
  },
  { name: 'Groups', path: 'groups' },
];

export function WorkspaceSettingsLayout() {
  // TODO: convert to data fetching
  const workspaces: SelectWorkSpaceProps['workspaces'] = useMemo(() => {
    return [
      { id: 'nnnnn', name: 'nagy nabil' },
      { id: 'nnnnn', name: 'nagy nabil' },
      { id: 'aaa', name: 'Ahmed Azzam' },
    ];
  }, []);

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
        {/*always show workspace*/}
        <SelectWorkSpace workspaces={workspaces} />
      </div>
      {/*RENDER CHILD ROUTE*/}
      <Outlet />
    </>
  );
}
