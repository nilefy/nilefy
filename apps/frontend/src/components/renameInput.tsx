import React from 'react';
import { Input } from './ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useToast } from './ui/use-toast';
import { PageDto } from '@/api/pages.api';

function RenameInput({
  page,
  updateEditMode,
}: {
  page: PageDto;
  updateEditMode: (show: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: updateMutate } = api.pages.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Page Name Updated Successfully',
      });
    },
  });
  const handleRenamePage = (pageName: string) => {
    if (pageName.length > 0 && pageName != page.name) {
      updateMutate({
        workspaceId: 1,
        appId: 1,
        pageId: page.id,
        pageDto: {
          name: pageName,
        },
      });
    }
    updateEditMode(false);
  };

  return (
    <Input
      defaultValue={page.name}
      autoFocus
      onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value;
        handleRenamePage(name);
        event.stopPropagation();
      }}
      onKeyDown={(
        event: React.ChangeEvent<HTMLInputElement> &
          React.KeyboardEvent<HTMLInputElement>,
      ) => {
        if (event.key === 'Enter') {
          const name = event.target.value;
          handleRenamePage(name);
          event.stopPropagation();
        }
      }}
    />
  );
}

export default RenameInput;
