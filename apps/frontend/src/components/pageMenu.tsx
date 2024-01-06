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
import { Dialog, DialogHeader } from './ui/dialog';
import { DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { PAGES_QUERY_KEY, PageDto } from '@/api/pages.api';
import { useParams } from 'react-router-dom';

function UpdateHandleDialog({
  open,
  setIsOpen,
  page,
  updateHandle,
}: {
  open: boolean;
  setIsOpen: (show: boolean) => void;
  page: PageDto;
  updateHandle: (data: {
    workspaceId: number;
    appId: number;
    pageId: number;
    pageDto: {
      handle: string;
    };
  }) => void;
}) {
  const { workspaceId, appId } = useParams<{
    workspaceId: string;
    appId: string;
  }>();
  const form = useForm({
    defaultValues: {
      name: page.handle,
    },
  });
  const onSubmit = (data: { name: string }) => {
    updateHandle({
      workspaceId: +(workspaceId as string),
      appId: +(appId as string),
      pageId: page.id,
      pageDto: {
        handle: data.name,
      },
    });
    setIsOpen(false);
  };

  return (
    <div className="right-10">
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page Handle</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Handle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Page Handle"
                          onFocus={() => setIsOpen(true)}
                          // onKeyDown={(
                          //   event: React.ChangeEvent<HTMLInputElement> &
                          //     React.KeyboardEvent<HTMLInputElement>,
                          // ): void => {
                          //   if (event.key === 'Enter') {
                          //     const newHandle = event.target.value;
                          //     updateHandle({
                          //       workspaceId: 1,
                          //       appId: 1,
                          //       pageId: page.id,
                          //       pageDto: {
                          //         handle: newHandle,
                          //       },
                          //     });
                          //   }
                          // }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save</Button>
                <Button>Cancel</Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
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
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      toast({
        title: 'Page Cloned Successfully',
      });
    },
  });
  const { mutate: deleteMutate } = api.pages.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      toast({
        title: 'Page Deleted Successfully',
      });
    },
    onError(error) {
      toast({
        variant: 'destructive',
        title: error.message,
      });
    },
  });
  // const { mutate: markHomePageMutate } = api.apps.update.useMutation({
  //   onMutate: () => {
  //     console.log('updating');
  //   },
  //   onSuccess: () => {
  //     toast({ title: 'Homepage Updated Successfully' });
  //   },
  // });

  const { mutate: updateMutate } = api.pages.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
  return (
    <div className="flex  items-center justify-start  text-sm">
      {/* <UpdateHandleDialog
        open={isUpdateHandle}
        setIsOpen={setIsUpdateHandle}
        page={page}
        updateHandle={updateMutate}
      /> */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col gap-2 ">
          <DropdownMenuItem className="flex flex-col items-start gap-3  hover:cursor-pointer ">
            {/* //TODO : use a dialog to update the pagehandle
            as there's an issue with putting manipulating an input directly inside a dropdownmenu
            */}
            <Label>Page Handle</Label>
            <Input
              // readOnly
              defaultValue={page.handle}
              onFocus={() => {
                setIsUpdateHandle(true);
                setIsOpen(false);
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
          {/* <DropdownMenuItem
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
          </DropdownMenuItem> */}
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
