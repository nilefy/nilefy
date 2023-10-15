import { Link, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, Plus } from 'lucide-react';
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

export type SelectWorkSpaceProps = {
  /**
   * all workspaces available to the user
   */
  workspaces: { id: string; name: string; imageUrl?: string }[];
};

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
      workspaceMeta: SelectWorkSpaceProps['workspaces'][number];
    };

const workspaceSchema = z.object({
  name: z.string().min(3).max(255),
});
type WorkspaceSchema = z.infer<typeof workspaceSchema>;

function WorkspaceMetaDialog(props: WorkspaceMetaDialogProps) {
  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: props.insert ? '' : props.workspaceMeta.name,
    },
  });

  function onSubmit(values: WorkspaceSchema) {
    // TODO: call the server
    console.log(values);
  }

  return (
    <Dialog>
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
                <AvatarImage src={props.workspaceMeta.imageUrl} />
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
            <Button type="submit">{props.insert ? 'create' : 'save'}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
/**
 * detect current workspace from the url
 */
export function SelectWorkSpace(props: SelectWorkSpaceProps) {
  const { workspaceId } = useParams();
  if (workspaceId === undefined) {
    throw new Error('must have active workspace id');
  }
  const currentWorkspce = props.workspaces.find((i) => i.id === workspaceId);
  if (currentWorkspce === undefined) {
    throw new Error('Not Found');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mt-auto" asChild>
        <Button>
          {currentWorkspce.name} <ChevronDown size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="DropdownMenuContent">
        {/*current workspace*/}
        <WorkspaceMetaDialog insert={false} workspaceMeta={currentWorkspce} />
        <DropdownMenuSeparator />
        {/*all the workspaces links*/}
        {props.workspaces.map((workspace) => {
          return (
            <DropdownMenuItem key={workspace.id}>
              <Avatar className="mr-2">
                <AvatarImage src={workspace.imageUrl} />
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
