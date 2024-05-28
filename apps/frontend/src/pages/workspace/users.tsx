import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useMemo } from 'react';
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
import { User } from '@/api/users.api';

export function UsersManagement() {
  // TODO: convert to data fetching
  const users = useMemo<Omit<User, 'onboardingCompleted'>[]>(
    () => [
      {
        id: '1',
        username: 'nagy nabil 1',
        email: 'nagy@nagy',
        status: 'active',
      },
      {
        id: '2',
        username: 'nagy nabil 2',
        email: 'nagy@nagy',
        status: 'active',
      },
      {
        id: '3',
        username: 'nagy nabil 3',
        email: 'nagy@nagy',
        status: 'active',
      },
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
