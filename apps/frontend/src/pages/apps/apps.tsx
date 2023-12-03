import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { api } from '@/api';
import { Link, NavLink, useParams } from 'react-router-dom';
import { getLastUpdatedInfo } from '@/utils/date';
import { APPS_QUERY_KEY, AppI, AppMetaT, appMetaSchema } from '@/api/apps.api';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

function AppDropDown(props: { app: AppI }) {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { workspaceId } = useParams();
  const { mutate: deleteMutate } = api.apps.delete.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
      toast({
        title: 'deleted app successfully',
        description: 'app deleted',
      });
    },
  });
  const { mutate: updateMutate } = api.apps.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
      setOpen(false);
    },
  });

  const { mutate: clone } = api.apps.clone.useMutation({
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
      toast({
        title: 'cloned app successfully',
        description: 'new app name ' + data.name,
      });
    },
  });

  const form = useForm<AppMetaT>({
    resolver: zodResolver(appMetaSchema.partial()),
    defaultValues: {
      name: props.app.name,
      description: props.app.description ?? undefined,
    },
  });
  if (!workspaceId) throw new Error();

  function onSubmit(data: Partial<AppMetaT>) {
    if (!workspaceId) throw new Error();
    updateMutate({
      workspaceId: +workspaceId,
      appId: props.app.id,
      data,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Dialog open={open} onOpenChange={setOpen}>
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

        {/*
          CLONE
          */}
        <DropdownMenuItem
          onClick={() =>
            clone({ workspaceId: +workspaceId, appId: props.app.id })
          }
        >
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
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteMutate({
                    workspaceId: +workspaceId,
                    appId: props.app.id,
                  });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreateAppDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { workspaceId } = useParams();
  const { mutate, isPending } = api.apps.insert.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
      setOpen(false);
    },
  });

  const form = useForm<AppMetaT>({
    resolver: zodResolver(appMetaSchema),
    mode: 'onSubmit',
    defaultValues: {
      description: undefined,
      name: '',
    },
  });

  function onSubmit(data: AppMetaT) {
    if (!workspaceId) throw new Error('must have workspaceid');
    mutate({
      workspaceId: +workspaceId,
      data,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">create new app</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create App</DialogTitle>
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
                    <Textarea placeholder="Enter app description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              Create App
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationsView() {
  const { workspaceId } = useParams();
  const apps = api.apps.index.useQuery(+(workspaceId as string));

  if (apps.isError) {
    throw apps.error;
  } else if (apps.isPending) {
    return <>loading</>;
  }
  return (
    <div className="flex h-full w-full flex-col gap-5 p-6">
      <Input
        type="search"
        placeholder="search apps in this workspace"
        className="w-full"
      />
      <div className="flex h-full w-full flex-wrap gap-8 overflow-y-auto">
        {apps.data.map((app) => (
          <Card
            key={app.id}
            className="h-fit min-w-[33%] max-w-[33%] hover:cursor-pointer hover:border hover:border-blue-400"
          >
            <CardHeader className="flex flex-col">
              <div className="flex w-full justify-between">
                <CardTitle className="line-clamp-1 w-11/12">
                  {app.name}
                </CardTitle>
                <AppDropDown app={app} />
              </div>
              <CardDescription className="line-clamp-1">
                Edited{' '}
                {getLastUpdatedInfo(
                  new Date(app.updatedAt ?? app.createdAt),
                  false,
                )}{' '}
                by {app.updatedBy?.username || app.createdBy.username}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-1">{app.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-5">
              <Link
                to={`apps/${app.id}`}
                className={buttonVariants({ variant: 'default' })}
              >
                Edit
              </Link>
              <Button>Launch</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ApplicationsLayout() {
  return (
    <div className="flex h-full w-full">
      {/*workspace settings sidebar*/}
      <div className="flex h-full w-1/4 min-w-[15%] flex-col gap-4 bg-primary/10 p-6">
        <h2 className="ml-2 text-3xl">Applications</h2>
        <div className=" w-full">
          <CreateAppDialog />
        </div>
        <div className="mt-auto">
          <SelectWorkSpace />
        </div>
      </div>
      <ApplicationsView />
    </div>
  );
}
