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
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  WORKSPACES_QUERY_KEY,
  Workspace,
  WorkspaceSchema,
  workspaceSchema,
} from '@/api/workspaces.api';
import { api } from '@/api';

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

function WorkspaceMetaDialog(props: WorkspaceMetaDialogProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const createWorkspace = api.workspaces.insert.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY] });
      setModalOpen(false);
    },
  });

  const updateWorkspace = api.workspaces.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY] });
      setModalOpen(false);
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
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
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
              <span className="line-clamp-1 w-11/12">
                {props.workspaceMeta.name}
              </span>
              <Edit className="ml-auto" size={20} />
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
 */
export function SelectWorkSpace() {
  const { data: workspaces } = api.workspaces.index.useQuery();
  const { workspaceId } = useParams();
  if (workspaceId === undefined) {
    throw new Error('must have active workspace id');
  }
  const currentWorkspce = workspaces!.find((i) => i.id === +workspaceId);
  if (currentWorkspce === undefined) {
    throw new Error('Workspace Not Found');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full">
        <Button>
          <span className="line-clamp-1 w-11/12">{currentWorkspce.name}</span>
          <ChevronDown size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="DropdownMenuContent overflow-y-auto scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10">
        {/*current workspace*/}
        <WorkspaceMetaDialog insert={false} workspaceMeta={currentWorkspce} />
        <DropdownMenuSeparator />
        {/*all the workspaces links*/}
        {workspaces!.map((workspace) => {
          return (
            <DropdownMenuItem
              key={workspace.id}
              className="h-full cursor-pointer"
              asChild
            >
              <Link to={`/${workspace.id}`}>
                <Avatar className="mr-2">
                  <AvatarImage src={workspace.imageUrl ?? undefined} />
                  <AvatarFallback>{getInitials(workspace.name)}</AvatarFallback>
                </Avatar>
                <span className="line-clamp-1">{workspace.name}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        {/* add new workspace */}
        <WorkspaceMetaDialog insert={true} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
