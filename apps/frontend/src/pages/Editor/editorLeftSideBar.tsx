import { Inspector } from '@/components/inspector';
import { ModeToggle } from '@/components/mode-toggle';
import { PageSelector } from '@/components/pageSelector';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
import { LogOut, Wind } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

export function EditorLeftSidebar() {
  const { workspaceId } = useParams();
  const { mutate } = useSignOut();

  return (
    <div className="flex h-full w-max flex-col gap-5 p-3">
      <NavLink to={`/${workspaceId}`}>
        <Wind size={30} />
      </NavLink>
      {/*paths*/}
      <div className=" flex flex-col gap-4">
        <Inspector />
        <PageSelector />
      </div>
      <div className="mt-auto flex flex-col gap-4">
        <ModeToggle />
      </div>
      <Button variant={'ghost'} size={'icon'} onClick={() => mutate()}>
        <LogOut />
      </Button>
    </div>
  );
}