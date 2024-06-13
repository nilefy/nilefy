import { Users } from 'lucide-react';
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
import { api } from '@/api';
import { useParams } from 'react-router-dom';
import { WebloomLoader } from '@/components/loader';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// TODO: add roles
const inviteUserByEmailSchema = z.object({
  email: z.string().email(),
});

type InviteUserByEmailSchema = z.infer<typeof inviteUserByEmailSchema>;

function InviteByEmailTab() {
  const form = useForm<z.infer<typeof inviteUserByEmailSchema>>({
    resolver: zodResolver(inviteUserByEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: InviteUserByEmailSchema) {
    console.log(values);
  }
  return (
    <TabsContent value="email">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@nilefy.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </TabsContent>
  );
}

function InviteUsersSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Users />
          Add users
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add users</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="flex w-full  gap-2 p-6 leading-4">
            <TabsTrigger value="email">Invite With Email</TabsTrigger>
            <TabsTrigger value="csv">Upload CSV file</TabsTrigger>
          </TabsList>
          <InviteByEmailTab />
          <TabsContent value="csv">Change your password here.</TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export function UsersManagement() {
  const { workspaceId } = useParams();
  const users = api.workspaces.users.useQuery(+workspaceId!);
  if (users.isPending) {
    return <WebloomLoader />;
  } else if (users.isError) {
    throw users.error;
  }

  return (
    <div className="mx-auto flex h-full w-4/6 flex-col items-center justify-center gap-3 ">
      <div className="flex w-full justify-between">
        <p>{users.data.length} users</p>
        <InviteUsersSheet />
      </div>
      <div className="flex w-full flex-col justify-between bg-primary/5 p-2">
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
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
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
