import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, MoreVertical, Trash, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
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

const appMetaSchema = z.object({
  name: z.string().min(4).max(255),
  description: z.string().min(4).max(255).optional(),
});
type AppMetaT = z.infer<typeof appMetaSchema>;

function AppDropDown() {
  const form = useForm<AppMetaT>({
    resolver: zodResolver(appMetaSchema),
    defaultValues: {
      // TODO: add default from the api
      name: '',
      description: '',
    },
  });

  function onSubmit(values: AppMetaT) {
    console.log(values);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Wrench className="mr-2 h-4 w-4" />
              <span>App settings</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>App Settings</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="App name" {...field} />
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
                          placeholder="Enter app description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>

        {/*DELETE*/}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-500"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ApplicationsLayout() {
  return (
    <>
      {/*workspace settings sidebar*/}
      <div className="bg-primary/5 flex h-screen w-1/5 flex-col gap-5">
        <h2 className="ml-2 text-3xl">Applications</h2>
        <div className=" w-full">
          <Button className="w-full">create new app</Button>
        </div>
        <div className="mt-auto">
          <SelectWorkSpace />
        </div>
      </div>
      <div className="flex w-full flex-col gap-5 pl-6 pt-6">
        <Input
          type="search"
          placeholder="search apps in this workspace"
          className="w-full"
        />
        <div className="flex w-full flex-wrap gap-16">
          {/*TODO: loop through apps from the backebd*/}
          <Card className="min-w-[33%] max-w-[33%] hover:cursor-pointer hover:border hover:border-blue-400">
            <CardHeader className="flex flex-col">
              <div className="flex w-full justify-between">
                <CardTitle>Untitled</CardTitle>
                <AppDropDown />
              </div>
              <CardDescription>
                Edited 38 mins ago by nagy-nabil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>no description</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-5">
              <Button>Edit</Button>
              <Button>Launch</Button>
            </CardFooter>
          </Card>

          <Card className="min-w-[33%] max-w-[33%] hover:cursor-pointer hover:border hover:border-blue-400">
            <CardHeader className="flex flex-col">
              <div className="flex w-full justify-between">
                <CardTitle className="line-clamp-1 w-11/12">
                  Untitled Untitled Untitled Untitled Untitled Untitled Untitled
                  Untitled Untitled Untitled Untitled Untitled Untitled{' '}
                </CardTitle>
                <AppDropDown />
              </div>
              <CardDescription>
                Edited 38 mins ago by nagy-nabil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-1">
                no description no descriptionno descriptionno descriptionno
                descriptionno descriptionno descriptionno descriptionno
                descriptionno descriptionno descriptionno descriptionno
                descriptionno descriptionno description
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-5">
              <Button>Edit</Button>
              <Button>Launch</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
