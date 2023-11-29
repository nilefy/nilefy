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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Group, GroupMetaSchema, groupMetaSchema } from '@/api/groups.api';
import { User } from '@/api/users.api';
import { api } from '@/api';

// type BuiltinPermissions =

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

function InsertGroupDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const insertMutation = api.groups.insert.useMutation({
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
  const updateMutation = api.groups.update.useMutation({
    onSuccess(data) {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      form.reset();
      setOpen(false);
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

/**
 * render table to show all grpups
 */
export function GroupsManagement() {
  const { workspaceId } = useParams();
  const groups = api.groups.index.useQuery(+(workspaceId as string));

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
      <div className="flex h-2/3 w-full justify-between bg-primary/5 p-2">
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

const permissionTypes = z.enum([
  'Workspaces-Read',
  'Workspaces-Write',
  'Workspaces-Delete',
  // APPS
  'Apps-Read',
  'Apps-Write',
  'Apps-Delete',
]);
type PermissionTypes = z.infer<typeof permissionTypes>;

type Permission = {
  id: number;
  name: PermissionTypes;
};

async function getAllPermissions() {
  const res = await fetchX('permissions', {
    method: 'GET',
  });
  return (await res.json()) as Permission[];
}

async function togglePermission({
  workspaceId,
  roleId,
  permissionId,
}: {
  workspaceId: number;
  roleId: number;
  permissionId: Permission['id'];
}) {
  await fetchX(
    `workspaces/${workspaceId}/roles/${roleId}/togglepermission/${permissionId}`,
    {
      method: 'PUT',
    },
  );
}

function useTogglePermission() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: togglePermission,
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({
        queryKey: ['groups', variables.workspaceId, variables.roleId],
      });
    },
  });
  return mutate;
}

function usePermissions() {
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: getAllPermissions,
  });
  return permissions;
}

function PermissionsTab({
  permissions,
  isAdmin,
}: {
  permissions: Permission[];
  isAdmin: boolean;
}) {
  const { workspaceId, groupId } = useParams();
  const allPermissions = usePermissions();
  const togglePermission = useTogglePermission();
  // just for easy check
  const persId = new Set(permissions.map((p) => p.id));

  if (allPermissions.isPending) {
    return <>loading</>;
  } else if (allPermissions.isError) {
    throw allPermissions.error;
  }

  return (
    <div className="ml-4 flex flex-col gap-3">
      <div className="h-5">
        {isAdmin ? <p>admin has all permissions</p> : null}
      </div>
      {allPermissions.data.map((per) => (
        <Label key={per.id} className="flex gap-5">
          <Checkbox
            defaultChecked={persId.has(per.id)}
            onCheckedChange={(c) => {
              console.log('per: ', per.id, 'state: ', c);
              if (!workspaceId || !groupId)
                throw new Error(
                  'this component only works under workspaceId and roleId',
                );
              togglePermission.mutate({
                workspaceId: +workspaceId,
                roleId: +groupId,
                permissionId: per.id,
              });
            }}
            value={per.id}
            disabled={isAdmin || togglePermission.isPending}
          />
          {per.name}
        </Label>
      ))}
    </div>
  );
}

function UsersTab({
  users,
  isEveryone,
}: {
  users: User[];
  isEveryone: boolean;
}) {
  return (
    <div>
      {isEveryone ? (
        <p>
          cannot add users manually all users are added automatically to this
          group
        </p>
      ) : null}
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
    </div>
  );
}

/*
 * render single group data as nested route
 */
export function GroupManagement() {
  const { workspaceId, groupId } = useParams();
  const { isError, isPending, data, error } = api.groups.one.useQuery(
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
      <Tabs defaultValue="permissions" className="h-2/3 w-full" key={data.name}>
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
          <UsersTab users={data.users} isEveryone={data.name === 'everyone'} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab
            permissions={data.permissions}
            isAdmin={data.name === 'admin'}
          />
        </TabsContent>
        <TabsContent value="datasources">
          {/*TODO: */}
          admin will chose what datasources available for users in this group
        </TabsContent>
      </Tabs>
    </div>
  );
}
