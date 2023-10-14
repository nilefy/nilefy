import { ModeToggle } from '@/components/mode-toggle';
import { Link, NavLink, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, ChevronDown, Plus, Users } from 'lucide-react';
import { useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * depends that the length of `str` is atleast 1
 */
function getInitials(str: string) {
  const splits = str.split(' ', 2);
  return `${splits[0][0]}${splits[1][0] ?? ''}`;
}

type SelectWorkSpaceProps = {
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
function SelectWorkSpace(props: SelectWorkSpaceProps) {
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

type User = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'invited' | 'archived';
  imageUrl?: string;
};

export function UsersManagement() {
  // TODO: convert to data fetching
  const users = useMemo<User[]>(
    () => [
      { id: '1', name: 'nagy nabil 1', email: 'nagy@nagy', status: 'active' },
      { id: '2', name: 'nagy nabil 2', email: 'nagy@nagy', status: 'active' },
      { id: '3', name: 'nagy nabil 3', email: 'nagy@nagy', status: 'active' },
    ],
    [],
  );

  return (
    <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
      <div className="flex w-full justify-between">
        <p>{users.length} users</p>
        {/*TODO: remove the button and add ui to add users*/}
        <Button>
          <Users />
          Add users
        </Button>
      </div>
      <div className="bg-primary/5 flex w-full flex-col justify-between p-2">
        <div className="flex gap-4">
          <span>Showing</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue defaultValue="all" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="search by name or email" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>email</TableHead>
              <TableHead>statue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// type BuiltinPermissions =
// export type Group = {
//   id: string;
//   name: string;
//   users: User[];
//   // permissions:
// };
//
// export function GroupManagement() {
//   // TODO: convert to data fetching
//   const groups = useMemo<Group[]>(
//     () => [
//       { id: '1', name: 'nagy nabil 1', users: [] },
//       { id: '2', name: 'nagy nabil 2', users: [] },
//       { id: '3', name: 'nagy nabil 3', users: [] },
//     ],
//     [],
//   );
//
//   return (
//     <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
//       <div className="flex w-full justify-between">
//         <p>{groups.length} groups</p>
//         {/*TODO: remove the button and add ui to add users*/}
//         <Button>
//           <Users />
//           Add new group
//         </Button>
//       </div>
//       <div className="bg-primary/5 flex w-full justify-between p-2">
//         <div className="flex flex-col gap-4">
//           {groups.map((group) => (
//             <NavLink key={group.id} to="">
//               {group.name}
//             </NavLink>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

const workspacePaths = [
  {
    name: 'Users',
    path: '',
  },
  { name: 'Groups', path: 'groups' },
];

export function Dashboard() {
  // TODO: convert to data fetching
  const workspaces: SelectWorkSpaceProps['workspaces'] = useMemo(() => {
    return [
      { id: 'nnnnn', name: 'nagy nabil' },
      { id: 'nnnnn', name: 'nagy nabil' },
      { id: 'aaa', name: 'Ahmed Azzam' },
    ];
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <div className="bg-primary/5 flex h-screen w-1/5 flex-col gap-5">
        <h2 className="text-3xl">WorkSpace Settings</h2>
        <nav className="flex flex-col gap-3">
          {workspacePaths.map((path) => (
            <NavLink
              key={path.path}
              to={path.path}
              className={({ isActive }) => {
                return `p-3 ${isActive ? 'bg-primary/10' : ''}`;
              }}
              end
            >
              {path.name}
            </NavLink>
          ))}
        </nav>
        <ModeToggle />
        {/*always show workspace*/}
        <SelectWorkSpace workspaces={workspaces} />
      </div>
      <UsersManagement />
    </div>
  );
}
