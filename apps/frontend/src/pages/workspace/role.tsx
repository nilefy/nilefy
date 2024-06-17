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
import { useQueryClient } from '@tanstack/react-query';
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
import {
  Role,
  RoleMetaSchema,
  roleMetaSchema,
  ROLES_QUERY_KEY,
} from '@/api/roles.api';
import { User } from '@/api/users.api';
import { api } from '@/api';
import { NilefyLoader } from '@/components/loader';
import { PermissionI } from '@/api/permission.api';

type RoleMetaDialogProps = {
  form: UseFormReturn<RoleMetaSchema>;
  dialogTitle: string;
  dialogSubmitButtonTitle: string;
  triggeChildren: ReactElement;
  onSubmit: (values: RoleMetaSchema) => void;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
  operationError: string | null;
};

type UpdateRoleMetaProps = {
  roleMeta: RoleMetaSchema & { id: Role['id'] };
};

function RoleMetaDialog({
  form,
  triggeChildren,
  dialogTitle,
  dialogSubmitButtonTitle,
  onSubmit,
  dialogOpen,
  setDialogOpen,
  isPending,
  operationError,
}: RoleMetaDialogProps) {
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
                    <Input placeholder="My new Role" {...field} />
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
            {operationError ? <p>{operationError}</p> : null}
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

function InsertRoleDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const insertMutation = api.roles.insert.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      form.reset();
      setOpen(false);
    },
    onError(error) {
      setOperationError(error.message);
    },
  });
  const form = useForm<RoleMetaSchema>({
    resolver: zodResolver(roleMetaSchema),
    defaultValues: {
      name: '',
      description: undefined,
    },
  });
  function onSubmit(values: RoleMetaSchema) {
    if (!workspaceId)
      throw new Error(
        'role insert dialog can only works under workspaceId route',
      );
    insertMutation.mutate({
      workspaceId: +workspaceId,
      dto: values,
    });
  }

  return (
    <RoleMetaDialog
      form={form}
      onSubmit={onSubmit}
      dialogTitle="Create new Role"
      triggeChildren={
        <>
          <Plus className="mr-2" />
          <span>Add new Role</span>
        </>
      }
      dialogSubmitButtonTitle="create"
      dialogOpen={open}
      setDialogOpen={setOpen}
      isPending={insertMutation.isPending}
      operationError={operationError}
    />
  );
}

function UpdateRoleDialog({ roleMeta }: UpdateRoleMetaProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const form = useForm<RoleMetaSchema>({
    resolver: zodResolver(roleMetaSchema),
    defaultValues: {
      name: roleMeta.name,
      description: roleMeta.description,
    },
  });
  const updateMutation = api.roles.update.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
      form.reset();
      setOpen(false);
    },
    onError(error) {
      setOperationError(error.message);
    },
  });
  function onSubmit(values: RoleMetaSchema) {
    if (!workspaceId)
      throw new Error('role dialog can only works under workspaceId route');
    updateMutation.mutate({
      workspaceId: +workspaceId,
      roleId: roleMeta.id,
      dto: values,
    });
  }

  return (
    <RoleMetaDialog
      form={form}
      onSubmit={onSubmit}
      dialogTitle="Update Role"
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
      operationError={operationError}
    />
  );
}

function DeleteRoleAlert(props: { id: number }) {
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const deleteMutation = api.roles.delete.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Delete />
          delete role
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this role
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              deleteMutation.mutate({
                roleId: props.id,
                workspaceId: +(workspaceId as string),
              })
            }
          >
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
export function RolesManagement() {
  const { workspaceId } = useParams();
  const roles = api.roles.index.useQuery(+(workspaceId as string));

  if (roles.isError) {
    throw roles.error;
  } else if (roles.isPending) {
    return <NilefyLoader />;
  }
  console.log(
    '🪵 [role.tsx:298] ~ token ~ \x1b[0;32mroles\x1b[0m = ',
    roles.data,
  );

  return (
    <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
      <div className="flex w-full justify-between">
        <p>{roles.data.length} roles</p>
        <InsertRoleDialog />
      </div>
      <div className="bg-primary/5 flex h-2/3 w-full justify-between p-2">
        <div className="flex w-[20%] max-w-[20%] flex-col gap-4 overflow-y-auto border-r pr-2">
          <Input placeholder="search by name" />
          {roles.data.map((role) => (
            <NavLink
              key={role.id}
              to={role.id.toString()}
              className={({ isActive }) => {
                return `p-3 ${isActive ? 'bg-primary/10' : ''}`;
              }}
            >
              {role.name}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}

function PermissionsTab({
  permissions,
  isAdmin,
}: {
  permissions: PermissionI[];
  isAdmin: boolean;
}) {
  const { workspaceId, roleId } = useParams();
  const allPermissions = api.permissions.index.useQuery();
  const togglePermission = api.permissions.toggle.useMutation();
  // just for easy check
  const persId = new Set(permissions.map((p) => p.id));

  if (allPermissions.isPending) {
    return <NilefyLoader />;
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
            onCheckedChange={() => {
              if (!workspaceId || !roleId)
                throw new Error(
                  'this component only works under workspaceId and roleId',
                );
              togglePermission.mutate({
                workspaceId: +workspaceId,
                roleId: +roleId,
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
          role
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
 * render single role data as nested route
 */
export function RoleManagement() {
  const { workspaceId, roleId } = useParams();
  const { isError, isPending, data, error } = api.roles.one.useQuery(
    +(workspaceId as string),
    +(roleId as string),
  );

  if (isError) {
    throw error;
  } else if (isPending) {
    return <NilefyLoader />;
  }

  console.log('🪵 [role.tsx:431] ~ token ~ \x1b[0;32mdata\x1b[0m = ', data);
  return (
    <div className="flex w-full flex-col">
      <div className="flex justify-between">
        <p>{data.name}</p>
        <div className="flex h-10 gap-4">
          {/*if default role don't render delete/edit*/}
          {data.name === 'admin' || data.name === 'everyone' ? (
            <p>default role</p>
          ) : (
            <>
              <UpdateRoleDialog
                roleMeta={{
                  ...data,
                  description: data.description ?? undefined,
                }}
              />
              <DeleteRoleAlert id={data.id} />
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
          user will chose what apps this role can access here
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
          admin will chose what datasources available for users in this role
        </TabsContent>
      </Tabs>
    </div>
  );
}
