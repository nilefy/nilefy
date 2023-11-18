import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ReactElement, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormReturn, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from './users';
import { Delete, Edit, Loader, Plus } from 'lucide-react';
import { fetchX } from '@/utils/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatar';

// type BuiltinPermissions =
export type Group = {
  id: number;
  name: string;
  users: User[];
  description: string | null;
  permissions: string[];
};

const groupMetaSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
});
type GroupMetaSchema = z.infer<typeof groupMetaSchema>;

type GroupMetaDialogProps = {
  form: UseFormReturn<GroupMetaSchema>;
  dialogTitle: string;
  dialogSubmitButtonTitle: string;
  triggeChildren: ReactElement;
  onSubmit: (values: GroupMetaSchema) => void;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
};

// type InsertGroupMetaProps = GroupMetaDialogProps;
type UpdateGroupMetaProps = {
  groupMeta: GroupMetaSchema & { id: Group['id'] };
};

async function getGroups(i: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'GET',
  });
  return (await res.json()) as Omit<Group, 'users' | 'permissions'>[];
}

async function getGroup(i: { workspaceId: number; roleId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
    method: 'GET',
  });
  return (await res.json()) as Group;
}

async function insertGroup(i: { workspaceId: number; dto: GroupMetaSchema }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as GroupMetaSchema & { id: number };
}

async function updateGroup(i: {
  workspaceId: number;
  groupId: Group['id'];
  dto: GroupMetaSchema;
}) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.groupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as GroupMetaSchema & { id: number };
}

function InsertGroupDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const insertMutation = useMutation({
    mutationFn: async (...vars: Parameters<typeof insertGroup>) => {
      return await insertGroup(...vars);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      form.reset();
      setOpen(false);
    },
    onError(error) {
      console.log('error from mutation', error);
      throw error;
    },
  });
  const form = useForm<GroupMetaSchema>({
    resolver: zodResolver(groupMetaSchema),
    defaultValues: {
      name: '',
      description: undefined,
    },
  });
  function onSubmit(values: GroupMetaSchema) {
    if (!workspaceId)
      throw new Error('group dialog can only works under workspaceId route');
    insertMutation.mutate({
      workspaceId: +workspaceId,
      dto: values,
    });
  }

  return (
    <GroupMetaDialog
      form={form}
      onSubmit={onSubmit}
      dialogTitle="Create new Group"
      triggeChildren={
        <>
          <Plus className="mr-2" />
          <span>Add new group</span>
        </>
      }
      dialogSubmitButtonTitle="create"
      dialogOpen={open}
      setDialogOpen={setOpen}
      isPending={insertMutation.isPending}
    />
  );
}

function UpdateGroupDialog({ groupMeta }: UpdateGroupMetaProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const form = useForm<GroupMetaSchema>({
    resolver: zodResolver(groupMetaSchema),
    defaultValues: {
      name: groupMeta.name,
      description: groupMeta.description,
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (...vars: Parameters<typeof updateGroup>) => {
      console.log('gonna update', vars);
      return await updateGroup(...vars);
    },
    onSuccess(data) {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      form.reset();
      setOpen(false);
    },
    onError(error) {
      console.log(error);
      throw error;
    },
  });
  function onSubmit(values: GroupMetaSchema) {
    console.log('group id', groupMeta);
    if (!workspaceId)
      throw new Error('group dialog can only works under workspaceId route');
    updateMutation.mutate({
      workspaceId: +workspaceId,
      groupId: groupMeta.id,
      dto: values,
    });
  }

  return (
    <GroupMetaDialog
      form={form}
      onSubmit={onSubmit}
      dialogTitle="Update group"
      triggeChildren={
        <>
          <Edit className="mr-2" />
          <span>Edit name</span>
        </>
      }
      dialogSubmitButtonTitle="save"
      dialogOpen={open}
      setDialogOpen={setOpen}
      isPending={updateMutation.isPending}
    />
  );
}

function GroupMetaDialog({
  form,
  triggeChildren,
  dialogTitle,
  dialogSubmitButtonTitle,
  onSubmit,
  dialogOpen,
  setDialogOpen,
  isPending,
}: GroupMetaDialogProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggeChildren}</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
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
                    <Input placeholder="My new Group" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter role description"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader className="animate-spin " />
              ) : (
                dialogSubmitButtonTitle
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGroupAlert(props: { id: number }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Delete />
          delete group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            group
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => console.log('delete: ', props.id)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function useRoles(workspaceId: number) {
  return useQuery({
    queryKey: ['groups', workspaceId],
    queryFn: () => getGroups({ workspaceId }),
    staleTime: 0,
  });
}

function useRole(workspaceId: number, roleId: number) {
  return useQuery({
    queryKey: ['groups', workspaceId, roleId],
    queryFn: () => getGroup({ workspaceId, roleId }),
  });
}

/**
 * render table to show all grpups
 */
export function GroupsManagement() {
  const { workspaceId } = useParams();
  const groups = useRoles(+(workspaceId as string));

  if (groups.isError) {
    throw groups.error;
  } else if (groups.isPending) {
    return <>loading</>;
  }

  return (
    <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
      <div className="flex w-full justify-between">
        <p>{groups.data.length} groups</p>
        <InsertGroupDialog />
      </div>
      <div className="bg-primary/5 flex h-2/3 w-full justify-between p-2">
        <div className="flex w-[20%] max-w-[20%] flex-col gap-4 overflow-y-auto border-r pr-2">
          <Input placeholder="search by name" />
          {groups.data.map((group) => (
            <NavLink
              key={group.id}
              to={group.id.toString()}
              className={({ isActive }) => {
                return `p-3 ${isActive ? 'bg-primary/10' : ''}`;
              }}
            >
              {group.name}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}

// const permissionTypes = z.enum([
//   'Workspaces-Read',
//   'Workspaces-Write',
//   'Workspaces-Delete',
//   // APPS
//   'Apps-Read',
//   'Apps-Write',
//   'Apps-Delete',
// ]);
//
// type P = {
//   resource: string;
//   permission: string;
// };
//
// function PermissionsTab(permissions: string[]) {
//   const converted: P[] = permissions.map(p => {
//     const splited = p.split('-', 2);
//     return {
//       resource: splited[0],
//       permission: splited[1]
//     }
//   })
// return (<>{permissionTypes.options.map(per => (
//
// ))}</>)
// }

function UsersTab({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]"></TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">
              <Avatar className="mr-2">
                <AvatarImage src={u.imageUrl ?? undefined} />
                <AvatarFallback>{getInitials(u.username)}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{u.username}</TableCell>
            <TableCell>{u.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/*
 * render single group data as nested route
 */
export function GroupManagement() {
  const { workspaceId, groupId } = useParams();
  const { isError, isPending, error, data } = useRole(
    +(workspaceId as string),
    +(groupId as string),
  );

  if (isError) {
    throw error;
  } else if (isPending) {
    return <>loading</>;
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex justify-between">
        <p>{data.name}</p>
        <div className="flex h-10 gap-4">
          {/*if default group don't render delete/edit*/}
          {data.name === 'admin' || data.name === 'everyone' ? (
            <p>default group</p>
          ) : (
            <>
              <UpdateGroupDialog
                groupMeta={{
                  ...data,
                  description: data.description ?? undefined,
                }}
              />
              <DeleteGroupAlert id={data.id} />
            </>
          )}
        </div>
      </div>
      <Tabs defaultValue="permissions" className="h-2/3 w-full">
        <TabsList className="mt-4 w-full gap-6">
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="datasources">Datasources</TabsTrigger>
        </TabsList>
        <TabsContent value="apps">
          {/*TODO: */}
          user will chose what apps this group can access here
        </TabsContent>
        <TabsContent value="users">
          <UsersTab users={data.users} />
        </TabsContent>
        <TabsContent value="permissions">
          {/*TODO: */}
          {JSON.stringify(data.permissions)}
        </TabsContent>
        <TabsContent value="datasources">
          {/*TODO: */}
          admin will chose what datasources available for users in this group
        </TabsContent>
      </Tabs>
    </div>
  );
}
