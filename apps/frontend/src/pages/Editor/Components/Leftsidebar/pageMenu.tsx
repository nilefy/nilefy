import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { PAGES_QUERY_KEY, PageDto } from '@/api/pages.api';

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: cloneMutate } = api.pages.clone.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      toast({
        title: 'Page Cloned Successfully ✅',
      });
    },
  });
  const { mutate: deleteMutate } = api.pages.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      toast({
        title: 'Page Deleted Successfully ✅',
      });
    },
    onError(error) {
      toast({
        variant: 'destructive',
        title: error.message,
      });
    },
  });

  const { mutate: updateMutate } = api.pages.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
  return (
    <div className="flex  items-center justify-start  text-sm">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col gap-2 ">
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
              updateMutate({
                workspaceId,
                appId,
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
                workspaceId,
                appId,
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
                workspaceId,
                appId,
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
                workspaceId,
                appId,
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
