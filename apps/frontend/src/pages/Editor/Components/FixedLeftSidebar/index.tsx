import { Inspector } from '@/pages/Editor/Components/FixedLeftSidebar/inspector';
import { ModeToggle } from '@/components/mode-toggle';
import { PageSelector } from '@/pages/Editor/Components/FixedLeftSidebar/pageSelector';
import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/useSignOut';
import { LogOut } from 'lucide-react';
import { BugsCount } from './bugsCount';

export function FixedLeftSidebar() {
  const { mutate } = useSignOut();

  return (
    <div className="flex h-full w-max flex-col gap-5 p-2">
      {/*paths*/}
      <div className="flex flex-col items-center justify-center gap-4">
        <Inspector />
        <PageSelector />
        <BugsCount />
      </div>
      <div className="mt-auto flex items-center justify-center">
        <ModeToggle />
      </div>
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => mutate()}
        className="flex items-center justify-center"
      >
        <LogOut />
      </Button>
    </div>
  );
}
