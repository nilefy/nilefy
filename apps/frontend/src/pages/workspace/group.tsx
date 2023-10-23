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
import { useMemo } from 'react';
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
import { User } from './users';
import { Delete, Edit, Plus } from 'lucide-react';

// type BuiltinPermissions =
export type Group = {
  id: string;
  name: string;
  users: User[];
  // permissions:
};

const groupMetaSchema = z.object({
  name: z.string().min(3).max(255),
});
type GroupMetaSchema = z.infer<typeof groupMetaSchema>;

type GroupMetaDialogProps =
  | {
      /**
       * true: will show the ui for adding new group
       * false: will show the ui to update group
       */
      insert: true;
    }
  | {
      /**
       * true: will show the ui for adding new group
       * false: will show the ui to update group
       */
      insert: false;
      groupMeta: GroupMetaSchema & { id: Group['id'] };
    };

function GroupMetaDialog(props: GroupMetaDialogProps) {
  const form = useForm<GroupMetaSchema>({
    resolver: zodResolver(groupMetaSchema),
    defaultValues: {
      name: props.insert ? '' : props.groupMeta.name,
    },
  });

  function onSubmit(values: GroupMetaSchema) {
    // TODO: call the server
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          {' '}
          {props.insert ? (
            <>
              <Plus className="mr-2" />
              <span>Add new group</span>
            </>
          ) : (
            <>
              <Edit className="mr-2" />
              <span>Edit name</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.insert ? <>Add new group</> : <>Update group</>}
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
                    <Input placeholder="My new Group" {...field} />
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

function DeleteGroupAlert(props: { id: string }) {
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
  // TODO: convert to data fetching
  const groups = useMemo<Group[]>(
    () => [
      { id: '1', name: 'Group 1', users: [] },
      { id: '2', name: 'Group 2', users: [] },
      { id: '3', name: 'Group 3', users: [] },
    ],
    [],
  );

  const form = useForm<GroupMetaSchema>({
    resolver: zodResolver(groupMetaSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: GroupMetaSchema) {
    // TODO: call the server
    console.log(values);
  }

  return (
    <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
      <div className="flex w-full justify-between">
        <p>{groups.length} groups</p>
        <GroupMetaDialog insert={true} />
      </div>
      <div className="flex w-full justify-between bg-primary/5 p-2">
        <div className="flex flex-col gap-4 border-r pr-2">
          <Input placeholder="search by name" />
          {groups.map((group) => (
            <NavLink
              key={group.id}
              to={group.id}
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

/*
 * render single group data as nested route
 */
export function GroupManagement() {
  //TODO: fetch single group data
  const groups = useMemo<Group[]>(
    () => [
      { id: '1', name: 'Group 1', users: [] },
      { id: '2', name: 'Group 2', users: [] },
      { id: '3', name: 'Group 3', users: [] },
    ],
    [],
  );
  const { groupId } = useParams();
  if (!groupId) throw new Error('must supply group id');
  const group = groups.find((i) => i.id === groupId);
  if (!group) throw new Error('404');

  return (
    <div className="flex w-full flex-col">
      <div className="flex">
        <p>{group.name}</p>
        <GroupMetaDialog insert={false} groupMeta={group} />
        <DeleteGroupAlert id={group.id} />
      </div>
      <Tabs defaultValue="account" className="h-full w-full">
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
          {/*TODO: */}
          admin will chose what users in this group
        </TabsContent>
        <TabsContent value="permissions">
          {/*TODO: */}
          admin chose what users in this group could do
        </TabsContent>
        <TabsContent value="datasources">
          {/*TODO: */}
          admin will chose what datasources available for users in this group
        </TabsContent>
      </Tabs>
    </div>
  );
}
