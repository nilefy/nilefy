import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
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
          <TabsList>
            <TabsTrigger value="email">Invite With Email</TabsTrigger>
            <TabsTrigger value="csv">Upload CSV file</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            Make changes to your account here.
          </TabsContent>
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
