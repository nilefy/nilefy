import { matchSorter } from 'match-sorter';
import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, FileDown, MoreVertical, Trash, Wrench } from 'lucide-react';
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
import { Await, Link, defer, useLoaderData, useParams } from 'react-router-dom';
import { getLastUpdatedInfo } from '@/utils/date';
import {
  APPS_QUERY_KEY,
  AppI,
  AppMetaT,
  appMetaSchema,
  exportApp,
  useAppsQuery,
} from '@/api/apps.api';
import { Suspense, useMemo, useState } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { NilefyLoader } from '@/components/loader';
import { DebouncedInput } from '@/components/debouncedInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { loaderAuth } from '@/utils/loaders';

export const appsLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
    }
    const query = useAppsQuery({
      workspaceId: +(params.workspaceId as string),
    });
    return defer({
      apps: queryClient.fetchQuery(query),
    });
  };

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
          EXPORT
          */}
        <DropdownMenuItem
          onClick={() =>
            exportApp({
              workspaceId: +workspaceId,
              appId: props.app.id,
              appName: props.app.name,
            })
          }
        >
          <FileDown className="mr-2 h-4 w-4" />
          <span>Export To Json</span>
        </DropdownMenuItem>
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

export function CreateAppDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { workspaceId } = useParams();

  const form = useForm<AppMetaT>({
    resolver: zodResolver(appMetaSchema),
    mode: 'onSubmit',
    defaultValues: {
      description: undefined,
      name: '',
    },
  });

  const { mutate, isPending } = api.apps.insert.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
      form.reset();
      setOpen(false);
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

function ApplicationsViewResolved() {
  const [appsQuery, setAppsQuery] = useState('');
  const { workspaceId } = useParams();
  const { data } = api.apps.index.useQuery({
    workspaceId: +(workspaceId as string),
  });
  const apps = data as NonNullable<typeof data>;
  const filteredApps = useMemo(() => {
    return matchSorter(apps, appsQuery, {
      keys: ['name'],
    });
  }, [apps, appsQuery]);

  return (
    <div className="flex h-full w-full flex-col gap-6  p-4 ">
      <DebouncedInput
        className="w-full"
        value={appsQuery}
        placeholder="Search apps in this workspace"
        type="search"
        onChange={(value) => {
          setAppsQuery(value.toString());
        }}
      />
      {apps.length === 0 ? (
        <div className="mx-auto flex h-full w-fit flex-col items-center justify-center gap-5">
          <p>
            looks like you do not have any apps try creating one, happy hacking!
          </p>
          <div className="w-fit">
            <CreateAppDialog />
          </div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="mx-auto flex h-full w-fit flex-col items-center justify-center gap-5">
          <p>
            No apps matching your search query try changing the search, or
            create new app
          </p>
          <div className="w-fit">
            <CreateAppDialog />
          </div>
        </div>
      ) : (
        <ScrollArea>
          <ul className="grid max-w-4xl grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:gap-y-10 lg:max-w-none lg:grid-cols-3">
            {/*APPS CARDS*/}
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                className="flex h-full w-full flex-col hover:border hover:border-blue-400"
              >
                <CardHeader className="flex flex-col">
                  <div className="flex w-full justify-between">
                    <CardTitle className="line-clamp-1 md:line-clamp-2">
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
                  <p className="line-clamp-3 ">{app.description}</p>
                </CardContent>
                <CardFooter className="mt-auto flex justify-end gap-5">
                  <Link
                    to={`apps/edit/${app.id}/${app.page.id}`}
                    className={buttonVariants({ variant: 'default' })}
                  >
                    Edit
                  </Link>
                  <Link
                    to={`apps/${app.id}/${app.page.id}`}
                    className={buttonVariants({ variant: 'default' })}
                  >
                    Launch
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}

function ApplicationsView() {
  const { apps } = useLoaderData();

  return (
    <Suspense fallback={<NilefyLoader />}>
      <Await resolve={apps}>
        <ApplicationsViewResolved />
      </Await>
    </Suspense>
  );
}

export function ApplicationsLayout() {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams();
  const importApp = api.apps.import.useMutation({
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [APPS_QUERY_KEY] });
    },
  });

  return (
    <div className="flex h-full w-full">
      {/*workspace settings sidebar*/}
      <div className="flex h-full w-1/4 min-w-[15%] flex-col gap-4 bg-primary/10 p-6">
        <h2 className="ml-2 text-3xl">Applications</h2>
        <div className=" flex w-full flex-col gap-5">
          <CreateAppDialog />
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                importApp.mutate({
                  workspaceId: +(workspaceId as string),
                  formData,
                });
              }}
            >
              <Label htmlFor="picture">Import From Json</Label>
              <Input id="file" name="file" type="file" />
              <Button type="submit">Import</Button>
            </form>
          </div>
        </div>
        <div className="mt-auto">
          <SelectWorkSpace />
        </div>
      </div>
      <ApplicationsView />
    </div>
  );
}
