import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Label } from './ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from './ui/input';
import { useState } from 'react';

export interface PageDto {
  id: number;
  handle: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  index: number;
  appId: number;
}

function PageMenu({
  workspaceId,
  appId,
  page,
  updateEditMode,
}: {
  workspaceId: number;
  appId: number;
  page: PageDto;
  updateEditMode: (show: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdateHandle, setIsUpdateHandle] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: cloneMutate } = api.pages.clone.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Page Cloned Successfully',
      });
    },
  });
  const { mutate: deleteMutate } = api.pages.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Page Deleted Successfully',
      });
    },
  });
  const { mutate: markHomePageMutate } = api.apps.update.useMutation({
    onMutate: () => {
      console.log('updating');
    },
    onSuccess: () => {
      toast({ title: 'Homepage Updated Successfully' });
    },
  });

  const { mutate: updateMutate } = api.pages.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
  return (
    <div className="flex  items-center justify-start  text-sm">
      <DropdownMenu open={isOpen}>
        <DropdownMenuTrigger>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col gap-2 ">
          <DropdownMenuItem className="flex flex-col items-start gap-3  hover:cursor-pointer ">
            {/* //TODO : fix focusing issue of the handle input */}
            <Label>Page Handle</Label>
            <Input
              // defaultValue={`.../${page.handle}`}
              // onFocus={setIsOpen(true)}
              onBlur={() => setIsOpen(true)}
              value={page.handle}
              onKeyDown={(
                event: React.ChangeEvent<HTMLInputElement> &
                  React.KeyboardEvent<HTMLInputElement>,
              ): void => {
                if (event.key === 'Enter') {
                  setIsOpen(false);
                  const newHandle = event.target.value;
                  updateMutate({
                    workspaceId,
                    appId,
                    pageId: page.id,
                    pageDto: {
                      handle: newHandle,
                    },
                  });
                }
              }}
            />
          </DropdownMenuItem>
          <hr />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => {
              updateEditMode(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer hover:text-gray-50"
            onClick={() => {
              markHomePageMutate({
                workspaceId,
                appId,
                data: {
                  homepageId: page.id,
                },
              });
            }}
          >
            Mark Home
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer hover:text-gray-50"
            onClick={() => {
              updateMutate({
                workspaceId: 1,
                appId: 1,
                pageId: page.id,
                pageDto: {
                  visible: !page.visible,
                },
              });
            }}
          >
            Hide Page on app menu
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer hover:text-gray-50"
            onClick={() =>
              cloneMutate({
                workspaceId: 1,
                appId: 1,
                pageId: page.id,
              })
            }
          >
            Duplicate Page
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer hover:text-gray-50"
            onClick={() => {
              updateMutate({
                workspaceId: 1,
                appId: 1,
                pageId: page.id,
                pageDto: {
                  enabled: !page.enabled,
                },
              });
            }}
          >
            Disable
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer hover:text-gray-50"
            onClick={() => {
              deleteMutate({
                workspaceId: 1,
                appId: 1,
                pageId: page.id,
              });
            }}
          >
            Delete Page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default PageMenu;
