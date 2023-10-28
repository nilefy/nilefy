import { Link, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, Plus, Loader } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/utils/avatar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchX } from '@/utils/fetch';
import { useState } from 'react';

export type Workspace = { id: number; name: string; imageUrl: string | null };
export type WorkSpaces = Workspace[];

type WorkspaceMetaDialogProps =
  | {
      /**
       * true: will show the ui for adding new workspace
       * false: will show the ui to update workspace
       */
      insert: true;
    }
  | {
      /**
       * true: will show the ui for adding new workspace
       * false: will show the ui to update workspace
       */
      insert: false;
      workspaceMeta: Workspace;
    };

const workspaceSchema = z.object({
  name: z.string().min(3).max(255),
});
type WorkspaceSchema = z.infer<typeof workspaceSchema>;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function WorkspaceMetaDialog(props: WorkspaceMetaDialogProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const createWorkspace = useMutation({
    mutationFn: async (data: WorkspaceSchema) => {
      const res = await fetchX('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
      return (await res.json()) as Workspace;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setModalOpen(false);
    },
    onError(error) {
      console.log(
        '🪵 [selectWorkspace.tsx:73] ~ token ~ \x1b[0;32merror\x1b[0m = ',
        error,
      );
    },
  });

  const updateWorkspace = useMutation({
    mutationFn: async (data: {
      id: Workspace['id'];
      workspace: WorkspaceSchema;
    }) => {
      await sleep(2000);
      const res = await fetchX(`/workspaces/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data.workspace),
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
      return (await res.json()) as Workspace;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setModalOpen(false);
    },
    onError(error) {
      console.log(
        '🪵 [selectWorkspace.tsx:73] ~ token ~ \x1b[0;32merror\x1b[0m = ',
        error,
      );
    },
  });

  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: props.insert ? '' : props.workspaceMeta.name,
    },
  });
  function onSubmit(values: WorkspaceSchema) {
    return props.insert
      ? createWorkspace.mutate(values)
      : updateWorkspace.mutate({
          id: props.workspaceMeta.id,
          workspace: values,
        });
  }
  /**
   * indicate is the form is submitting
   */
  const isPending = createWorkspace.isPending || updateWorkspace.isPending;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          {props.insert ? (
            <>
              <Plus className="mr-2" />
              <span>Add new Workspace</span>
            </>
          ) : (
            <>
              <Avatar className="mr-2">
                <AvatarImage src={props.workspaceMeta.imageUrl ?? undefined} />
                <AvatarFallback>
                  {getInitials(props.workspaceMeta.name)}
                </AvatarFallback>
              </Avatar>
              <span>{props.workspaceMeta.name}</span>
              <Edit className="ml-auto" />
            </>
          )}
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.insert ? <>Add new workspace</> : <>Update workspace</>}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My new workspace" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader className="animate-spin" />
              ) : props.insert ? (
                'create'
              ) : (
                'save'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * detect current workspace from the url
 *
 * NOTE: it gets the workspaces data from react query store under the name "workspaces"
 */
export function SelectWorkSpace() {
  const { data: workspaces } = useQuery<WorkSpaces>({
    queryKey: ['workspaces'],
    initialData: [],
  });
  const { workspaceId } = useParams();
  if (workspaceId === undefined) {
    throw new Error('must have active workspace id');
  }
  const currentWorkspce = workspaces.find((i) => i.id === +workspaceId);
  if (currentWorkspce === undefined) {
    throw new Error('Not Found');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full">
        <Button>
          {currentWorkspce.name} <ChevronDown size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="DropdownMenuContent">
        {/*current workspace*/}
        <WorkspaceMetaDialog insert={false} workspaceMeta={currentWorkspce} />
        <DropdownMenuSeparator />
        {/*all the workspaces links*/}
        {workspaces.map((workspace) => {
          return (
            <DropdownMenuItem key={workspace.id}>
              <Avatar className="mr-2">
                <AvatarImage src={workspace.imageUrl ?? undefined} />
                <AvatarFallback>{getInitials(workspace.name)}</AvatarFallback>
              </Avatar>
              <Link to={`/${workspace.id}`}>{workspace.name}</Link>
            </DropdownMenuItem>
          );
        })}
        {/* add new workspace */}
        <WorkspaceMetaDialog insert={true} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
