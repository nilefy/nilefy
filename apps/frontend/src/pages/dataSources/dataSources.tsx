import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import RjsfForm from '@rjsf/core';
import { useNavigate } from 'react-router-dom';
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
import { Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
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
  WsDataSourceI,
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
import { ConfigForm, ConfigFormGenricOnChange } from '@/components/configForm';
import { RJSFShadcn } from '@/components/rjsf_shad';

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

function DataSourcesView() {
  const { workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPending, isError, error, data } =
    api.globalDataSource.index.useQuery();
  const filteredDataSources = useMemo(() => {
    if (!data) {
      return;
    }
    const filter = searchParams.get('gfilter');
    const globalSearch = searchParams.get('gsearch');
    let tempData;
    if (filter === null || filter === '') {
      tempData = data;
    } else {
      tempData = data.filter((d) => d.type === filter);
    }
    return matchSorter(tempData, globalSearch ?? '', {
      keys: ['description', 'name'],
    });
  }, [searchParams, data]);

  if (isPending) {
    return <div>Loading...</div>;
  } else if (isError) {
    throw error;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-3">
      <DebouncedInput
        value={searchParams.get('gsearch') ?? ''}
        placeholder="Search"
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
      <ScrollArea className="h-full w-full">
        <div className="flex flex-wrap justify-between gap-6 ">
          {filteredDataSources?.map((ds) => {
            return (
              <div
                key={ds.id}
                className="flex w-[30%] flex-col items-center justify-center gap-4 border p-2"
              >
                <Avatar className="mr-2">
                  <AvatarImage src={ds.image ?? undefined} />
                  <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
                </Avatar>
                <p className="line-clamp-1">{ds.name}</p>
                <p className="line-clamp-2 h-12">{ds.description}</p>
                <CreatePluginForm
                  globalDataSourceId={ds.id}
                  workspaceId={+(workspaceId as string)}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function WorkspaceDataSourcesView() {
  const { workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isPending, isError, error } = api.dataSources.index.useQuery(
    +(workspaceId as string),
  );
  const { mutate: deleteMutate } = api.dataSources.delete.useMutation();
  const filteredPlugins = useMemo(() => {
    if (!data) {
      return;
    }
    const localSearch = searchParams.get('lsearch');
    return matchSorter(data, localSearch ?? '', {
      keys: ['name'],
    });
  }, [searchParams, data]);

  if (isPending) {
    return <div>Loading...</div>;
  } else if (isError) {
    throw error;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
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
      <ScrollArea className="w-full">
        <div className="flex w-full flex-col gap-6">
          {filteredPlugins?.map((ds) => {
            return (
              <div
                key={ds.id}
                className="flex w-full items-center justify-start gap-2"
              >
                <Link
                  className="flex items-center gap-4"
                  to={`/${workspaceId}/datasources/${ds.id}`}
                >
                  <Avatar className="mr-2">
                    <AvatarImage src={ds.dataSource.image ?? undefined} />
                    <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
                  </Avatar>
                  <p>{ds.name}</p>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger
                    className={buttonVariants({
                      variant: 'destructive',
                      size: 'icon',
                      className: 'ml-auto',
                    })}
                  >
                    <Trash />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. will remove all queries
                        related to this datasource
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
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

const dataSourceFilter = [
  {
    name: 'all',
    q: '',
  },
  {
    name: 'databases',
    q: 'database',
  },
  {
    name: 'APIs',
    q: 'api',
  },
  {
    name: 'Cloud Storage',
    q: 'cloud storage',
  },
  {
    name: 'Plugin',
    q: 'plugin',
  },
];

function DataSourcesSidebar() {
  const { workspaceId } = useParams();

  return (
    <div className="bg-primary/10 flex h-full w-1/4 min-w-[15%] flex-col">
      <h2 className="ml-2 text-3xl">Data Sources</h2>
      {/** plugins filter*/}
      <ScrollArea className="h-full">
        <h4>Filters</h4>
        <div className="flex flex-col gap-5">
          {dataSourceFilter.map((ds, i) => {
            return (
              <Link
                key={ds.q + i}
                to={{
                  pathname: `/${workspaceId}/datasources`,
                  search: `gfilter=${ds.q}`,
                }}
              >
                {ds.name}
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      {/** configured plugins*/}
      <h4>plugins</h4>
      <WorkspaceDataSourcesView />
      <div className="mt-auto">
        <SelectWorkSpace />
      </div>
    </div>
  );
}

export function GlobalDataSourcesView() {
  return (
    <div className="flex h-full w-full">
      <DataSourcesSidebar />
      <DataSourcesView />
    </div>
  );
}

export function DataSourceView() {
  const { datasourceId, workspaceId } = useParams();
  // const queryClient = useQueryClient();
  const { data, isPending, isError, error } = api.dataSources.one.useQuery(
    +(workspaceId as string),
    +(datasourceId as string),
  );
  // const { mutate: updateMutate } = api.dataSources.update.useMutation();
  // const onChange: ConfigFormGenricOnChange = (key, value) => {
  //   const queryKey = [
  //     DATASOURCES_QUERY_KEY,
  //     {
  //       workspaceId: +(workspaceId as string),
  //       dataSourceId: +(datasourceId as string),
  //     },
  //   ];
  //   queryClient.setQueryData<WsDataSourceI>(queryKey, (prev) => {
  //     if (!prev) return;
  //     return {
  //       ...prev,
  //       config: {
  //         ...prev.config,
  //         [key]: value,
  //       },
  //     };
  //   });
  // };
  // const submitUpdate = () => {
  //   // any changes made to the options i store them on the react query instance of the datasource
  //   // so to send to remote i get new values from react query
  //   const queryKey = [
  //     DATASOURCES_QUERY_KEY,
  //     {
  //       workspaceId: +(workspaceId as string),
  //       dataSourceId: +(datasourceId as string),
  //     },
  //   ];
  //   const dto = queryClient.getQueryData<WsDataSourceI>(queryKey);
  //   if (!dto) return;
  //   updateMutate({
  //     workspaceId: +(workspaceId as string),
  //     dataSourceId: +(datasourceId as string),
  //     dto: {
  //       config: dto.config,
  //     },
  //   });
  // };

  const log = (type: unknown) => console.log.bind(console, type);

  if (isPending) {
    return <>loading ....</>;
  } else if (isError) {
    throw error;
  }
  return (
    <div className="flex h-full w-full">
      <DataSourcesSidebar />
      <ScrollArea className="h-full w-full">
        <div className="flex w-full flex-col gap-5">
          <div className="flex gap-5">
            <Input defaultValue={data.name} />
          </div>
          <RJSFShadcn
            schema={data.dataSource.config}
            validator={validator}
            onChange={log('changed')}
            onSubmit={log('submitted')}
            onError={log('errors')}
            formData={data.config}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
