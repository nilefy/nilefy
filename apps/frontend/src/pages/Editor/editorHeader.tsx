import { commandManager } from '@/actions/CommandManager';
import { NilefyLoader } from '@/components/loader';
import { Button, buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { editorStore } from '@/lib/Editor/Models';
import { cn } from '@/lib/cn';
import { observer } from 'mobx-react-lite';
import { Link, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { APPS_QUERY_KEY } from '@/api/apps.api';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
export const EditorHeader = observer(function EditorHeader() {
  const { workspaceId, appId } = useParams();
  const appName = editorStore.name;
  const currentPageId = editorStore.currentPageId;
  const [currentAppEnv, setCurrentAppEnv] = useState<string>(
    editorStore.currentAppEnv[0].toUpperCase() +
      editorStore.currentAppEnv.slice(1),
  );
  const queryClient = useQueryClient();
  const { mutate: updateMutate } = api.apps.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
    },
  });
  const handleSelect = (env: 'development' | 'production') => {
    setCurrentAppEnv(env[0].toUpperCase() + env.slice(1));
    editorStore.setAppEnv(env);
    if (!workspaceId || !appId) throw new Error();
    updateMutate({
      workspaceId: +workspaceId,
      appId: +appId,
      data: { env },
    });
  };
  return (
    <div className="flex w-full items-center gap-5 border-b px-3 py-[4px]">
      <div className="h-full w-10">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <p>{appName}</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{currentAppEnv}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onSelect={() => handleSelect('development')}
          >
            Development
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onSelect={() => handleSelect('production')}
          >
            Production
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>{commandManager.socket?.isLoading ? <NilefyLoader /> : null}</div>
      <Link
        className={cn(
          buttonVariants({
            variant: 'outline',
          }),
          'ml-auto',
        )}
        to={`/${workspaceId}/apps/${appId}/${currentPageId}`}
      >
        Deploy
      </Link>
    </div>
  );
});
