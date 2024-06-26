import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import validator from '@rjsf/validator-ajv8';
import {
  Await,
  NavLink,
  Outlet,
  useAsyncValue,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/api';
import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/utils/avatar';
import { Activity, SaveIcon, Trash } from 'lucide-react';
import { Suspense, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { matchSorter } from 'match-sorter';
import { DebouncedInput } from '@/components/debouncedInput';
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
import { useForm } from 'react-hook-form';
import {
  DATASOURCES_QUERY_KEY,
  DataSourceMeta,
  GlobalDataSourceIndexRet,
  dataSourceMeta,
} from '@/api/dataSources.api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { RJSFShadcn } from '@/components/rjsf_shad';
import { NilefyLoader } from '@/components/loader';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import _ from 'lodash';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { LoadingButton } from '@/components/loadingButton';
import FormT from '@rjsf/core';
import { useToast } from '@/components/ui/use-toast';
// import { dataSourcesTypes } from '@nilefy/constants';

function CreatePluginForm({
  workspaceId,
  globalDataSourceId,
}: {
  globalDataSourceId: number;
  workspaceId: number;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();
  const form = useForm<DataSourceMeta>({
    resolver: zodResolver(dataSourceMeta),
    defaultValues: {
      name: '',
      config: {},
    },
  });
  const { mutate, isPending } = api.dataSources.insert.useMutation({
    onError(error) {
      setFormError(error.message);
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
      setFormError('');
      form.reset();
      setOpen(false);
      navigate(`/${workspaceId}/datasources/${data.id}`);
    },
  });
  function onSubmit(values: DataSourceMeta) {
    mutate({
      globalDataSourceId,
      workspaceId,
      dto: values,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={'sm'} variant={'outline'}>
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new Datasource</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>name</FormLabel>
                  <FormControl>
                    <Input placeholder="postgres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              Create
            </Button>
            <p className="text-red-500">{formError}</p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

//

export function GlobalDataSourcesView() {
  const { globalDataSources } = useLoaderData();

  return (
    <Suspense fallback={<NilefyLoader />}>
      <Await resolve={globalDataSources}>
        <GlobalDataSourcesResolved />
      </Await>
    </Suspense>
  );
}

export function GlobalDataSourcesResolved() {
  const data = useAsyncValue() as GlobalDataSourceIndexRet;
  const { workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filteredDataSources = useMemo(() => {
    if (!data) {
      return {};
    }
    const globalSearch = searchParams.get('gsearch');
    const tempData = matchSorter(data, globalSearch ?? '', {
      keys: ['name', 'description'],
    });
    return _.groupBy(tempData, 'type');
  }, [searchParams, data]);

  return (
    <div className="flex h-full w-full flex-col gap-6  p-4 ">
      <DebouncedInput
        className="w-full"
        value={searchParams.get('gsearch') ?? ''}
        placeholder="Search data sources"
        type="search"
        onChange={(value) => {
          setSearchParams(
            (prev) => {
              const s = new URLSearchParams(prev);
              s.set('gsearch', value.toString());
              return s;
            },
            { replace: true },
          );
        }}
      />
      {Object.keys(filteredDataSources).length === 0 ? (
        <div className="mx-auto flex h-full w-fit flex-col items-center justify-center gap-5">
          <p>No Data Sources match your search query try changing the search</p>
        </div>
      ) : (
        <ScrollArea>
          <div className="flex flex-col gap-3">
            {Object.entries(filteredDataSources).map(([type, dss]) => {
              return (
                <div
                  key={type}
                  className="flex h-full w-full max-w-full flex-col gap-1"
                >
                  <h2 id={type}>{type.toUpperCase()}</h2>
                  <ul className="grid w-full max-w-full grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:grid-cols-3 md:gap-y-10 lg:grid-cols-4">
                    {dss.map((ds) => {
                      return (
                        <Card
                          key={ds.id}
                          className="flex h-full w-full flex-col items-center justify-center gap-4 p-2 hover:border hover:border-blue-400"
                        >
                          <CardHeader className="flex flex-col items-center justify-center gap-4 font-bold">
                            <Avatar>
                              <AvatarImage src={ds.image ?? undefined} />
                              <AvatarFallback>
                                {getInitials(ds.name)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="line-clamp-1">{ds.name}</p>
                          </CardHeader>

                          <CardContent>
                            <p className="line-clamp-2 text-center">
                              {ds.description}
                            </p>
                          </CardContent>

                          <CardFooter className="mt-auto flex justify-end gap-5">
                            <CreatePluginForm
                              globalDataSourceId={ds.id}
                              workspaceId={+(workspaceId as string)}
                            />
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

/**
 * sidebar configured data sources
 */
function WorkspaceDataSourcesView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workspaceId } = useParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isPending, isError, error } = api.dataSources.index.useQuery({
    workspaceId: +(workspaceId as string),
  });
  const { mutate: deleteMutate } = api.dataSources.delete.useMutation({
    onMutate() {
      navigate(`/${workspaceId}/datasources`);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
      toast({
        title: 'Deleted Data Source Successfully ✅',
      });
    },
  });
  const filteredPlugins = useMemo(() => {
    if (!data) {
      return;
    }
    const localSearch = searchParams.get('lsearch');
    return matchSorter(data, localSearch ?? '', {
      keys: ['name'],
    });
  }, [searchParams, data]);

  if (isError) {
    throw error;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      {isPending && <NilefyLoader />}
      <DebouncedInput
        value={searchParams.get('lsearch') ?? ''}
        placeholder="Search"
        type="search"
        onChange={(value) => {
          setSearchParams(
            (prev) => {
              const s = new URLSearchParams(prev);
              s.set('lsearch', value.toString());
              return s;
            },
            { replace: true },
          );
        }}
      />
      <div className="scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10 flex h-full w-full flex-col gap-4  overflow-y-auto overflow-x-hidden">
        {!filteredPlugins ? (
          <p>No Data Sources match your search query try changing the search</p>
        ) : (
          filteredPlugins.map((ds) => {
            return (
              <div
                key={ds.id}
                className="flex w-full items-center justify-start"
              >
                <NavLink
                  end={true}
                  className={({ isActive }) => {
                    return cn(
                      'flex w-[100%] items-center gap-1 p-1 hover:bg-primary/20 rounded-xl overflow-hidden',
                      isActive ? 'bg-primary/20' : '',
                    );
                  }}
                  to={`/${workspaceId}/datasources/${ds.id}`}
                >
                  <Avatar className="mr-2">
                    <AvatarImage src={ds.dataSource.image ?? undefined} />
                    <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
                  </Avatar>
                  <p className="line-clamp-1">{ds.name}</p>

                  <AlertDialog>
                    <AlertDialogTrigger
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'icon',
                        className: 'ml-auto hover:bg-destructive',
                      })}
                    >
                      <Trash size={15} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. YOU HAVE TO CONNECT
                          QUUERIES CONNECTED TO THIS DATASOURCE TO NEW
                          DATASOURCE OR YOUR APP WILL NOT FUNCTION CORRECTLY
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (!workspaceId)
                              throw new Error('must have workspaceId');
                            deleteMutate({
                              workspaceId: +workspaceId,
                              dataSourceId: ds.id,
                            });
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </NavLink>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function DataSourceView() {
  const { toast } = useToast();
  const form = useRef<FormT>(null);
  const { datasourceId, workspaceId } = useParams();
  const { data, isPending, isError, error } = api.dataSources.one.useQuery(
    +(workspaceId as string),
    +(datasourceId as string),
  );
  const { mutate: updateMutate, isPending: isSubmitting } =
    api.dataSources.update.useMutation();
  const { mutate: testConnectionMutate, isPending: isTestingConnection } =
    api.dataSources.testConnection.useMutation({
      onSuccess(data) {
        toast({
          title: 'Connection Test ✅',
          description: data.msg,
        });
      },
      onError(error) {
        toast({
          variant: 'destructive',
          title: 'Connection Test ❌',
          description: error.message,
        });
      },
    });
  const nameRef = useRef<HTMLInputElement>(null);

  if (isPending) {
    return <NilefyLoader />;
  } else if (isError) {
    throw error;
  }
  return (
    <div key={data.id} className="flex h-full w-full flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label>Data Source Name</Label>
        <Input defaultValue={data.name} ref={nameRef} />
      </div>

      <ScrollArea className="h-full w-full">
        <Tabs defaultValue="dev">
          <TabsList className="w-full space-x-3">
            <TabsTrigger value="dev">Development</TabsTrigger>
            <TabsTrigger value="prod">Production</TabsTrigger>
          </TabsList>

          <TabsContent value="dev" className="h-full w-full ">
            <div className="p-2">
              <RJSFShadcn
                ref={form}
                schema={data.dataSource.config.schema}
                uiSchema={data.dataSource.config.uiSchema}
                formData={data.config.development}
                validator={validator}
                onSubmit={({ formData }) => {
                  if (
                    !workspaceId ||
                    !datasourceId ||
                    !nameRef ||
                    !nameRef.current
                  )
                    throw new Error(
                      "that's weird this function should run under workspaceId, datasourceId",
                    );
                  updateMutate({
                    workspaceId: +workspaceId,
                    dataSourceId: +datasourceId,
                    dto: {
                      name: nameRef.current.value,
                      config: formData,
                      env: 'development',
                    },
                  });
                }}
              >
                <div className=" mt-8 flex flex-wrap content-center justify-start gap-4">
                  <LoadingButton
                    key={'dsSave'}
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    <span className="flex flex-row justify-evenly">
                      <SaveIcon />
                      <p className="ml-2 mt-0.5 align-middle">Save</p>
                    </span>
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isTestingConnection}
                    type="button"
                    onClick={() => {
                      if (
                        !workspaceId ||
                        !datasourceId ||
                        !form ||
                        !form.current
                      ) {
                        throw new Error();
                      }
                      testConnectionMutate({
                        workspaceId: +workspaceId,
                        dataSourceId: +datasourceId,
                        dto: {
                          config: form.current.state.formData,
                        },
                      });
                    }}
                    key={'dsTest'}
                  >
                    <Activity />
                    Test Connection
                  </LoadingButton>
                </div>
              </RJSFShadcn>
            </div>
          </TabsContent>
          <TabsContent value="prod" className="h-full w-full ">
            <div className="p-2">
              <RJSFShadcn
                ref={form}
                schema={data.dataSource.config.schema}
                uiSchema={data.dataSource.config.uiSchema}
                formData={data.config.production}
                validator={validator}
                onSubmit={({ formData }) => {
                  if (
                    !workspaceId ||
                    !datasourceId ||
                    !nameRef ||
                    !nameRef.current
                  )
                    throw new Error(
                      "that's weird this function should run under workspaceId, datasourceId",
                    );
                  updateMutate({
                    workspaceId: +workspaceId,
                    dataSourceId: +datasourceId,
                    dto: {
                      name: nameRef.current.value,
                      config: formData,
                      env: 'production',
                    },
                  });
                }}
              >
                <div className=" mt-8 flex flex-wrap content-center justify-start gap-4">
                  <LoadingButton
                    key={'dsSave'}
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    <span className="flex flex-row justify-evenly">
                      <SaveIcon />
                      <p className="ml-2 mt-0.5 align-middle">Save</p>
                    </span>
                  </LoadingButton>
                  <LoadingButton
                    isLoading={isTestingConnection}
                    type="button"
                    onClick={() => {
                      if (
                        !workspaceId ||
                        !datasourceId ||
                        !form ||
                        !form.current
                      ) {
                        throw new Error();
                      }
                      testConnectionMutate({
                        workspaceId: +workspaceId,
                        dataSourceId: +datasourceId,
                        dto: {
                          config: form.current.state.formData,
                        },
                      });
                    }}
                    key={'dsTest'}
                  >
                    <Activity />
                    Test Connection
                  </LoadingButton>
                </div>
              </RJSFShadcn>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}

function DataSourcesSidebar() {
  const { workspaceId } = useParams();

  return (
    <div className="bg-primary/10 flex h-full w-1/4 min-w-[15%] flex-col gap-4 p-6">
      <Link
        to={{
          pathname: `/${workspaceId}/datasources`,
        }}
      >
        <h2 className="ml-2 text-3xl">Data Sources</h2>
      </Link>
      {/** plugins filter*/}
      {/* <div className="flex h-fit flex-col gap-3"> */}
      {/*   <h2 className="text-xl">Filters</h2> */}
      {/*   <div className="flex flex-col gap-5 pl-2"> */}
      {/*     {dataSourcesTypes.map((ds, i) => { */}
      {/*       return ( */}
      {/*         <Link */}
      {/*           key={ds + i} */}
      {/*           to={{ */}
      {/*             pathname: `/${workspaceId}/datasources`, */}
      {/*             // search: `gfilter=${ds.q}`, */}
      {/*             hash: ds, */}
      {/*           }} */}
      {/*           className="inline-flex h-11 items-center justify-start rounded-md pl-1 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" */}
      {/*         > */}
      {/*           {ds.toUpperCase()} */}
      {/*         </Link> */}
      {/*       ); */}
      {/*     })} */}
      {/*   </div> */}
      {/* </div> */}
      {/* <Separator /> */}
      {/** configured plugins*/}
      {/* <h4>plugins</h4> */}
      <WorkspaceDataSourcesView />
      <div className="mt-auto">
        <SelectWorkSpace />
      </div>
    </div>
  );
}

export function DataSourcesTemplate() {
  return (
    <div className="flex h-full w-full">
      <DataSourcesSidebar />
      <div className="h-full max-h-full w-full max-w-full overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
