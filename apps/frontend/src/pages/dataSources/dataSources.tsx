import validator from '@rjsf/validator-ajv8';
import { Outlet, useNavigate } from 'react-router-dom';
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
import { SaveIcon, Trash } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
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
import FormT from '@rjsf/core';
import { WebloomLoader } from '@/components/loader';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import _ from 'lodash';
import { dataSourcesTypes } from '@webloom/constants';

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

export function GlobalDataSourcesView() {
  const { workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPending, isError, error, data } =
    api.globalDataSource.index.useQuery();
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

  if (isPending) {
    // TODO: move inside the template
    return <WebloomLoader />;
  } else if (isError) {
    throw error;
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto overflow-x-hidden p-4 scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10 ">
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
          <p>
            No Data Sources match your search query try changing the search{' '}
          </p>
        </div>
      ) : (
        Object.entries(filteredDataSources).map(([type, dss]) => {
          return (
            <div
              key={type}
              className="flex h-full w-full max-w-full flex-col gap-6"
            >
              <h2 id={type}>{type.toUpperCase()}</h2>
              <ul className="grid w-full max-w-full grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:grid-cols-3 md:gap-y-10 lg:grid-cols-4">
                {dss.map((ds) => {
                  return (
                    <Card
                      key={ds.id}
                      className="flex h-full w-full flex-col items-center justify-center gap-4 p-2 hover:border hover:border-blue-400"
                    >
                      <CardHeader className="flex flex-col items-center justify-center gap-4">
                        <Avatar>
                          <AvatarImage src={ds.image ?? undefined} />
                          <AvatarFallback>
                            {getInitials(ds.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="line-clamp-1">{ds.name}</p>
                      </CardHeader>

                      <CardContent>
                        <p className="line-clamp-1">{ds.description}</p>
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
        })
      )}
    </div>
  );
}

/**
 * sidebar configured data sources
 */
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
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
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
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto overflow-x-hidden scrollbar-thin  scrollbar-track-foreground/10 scrollbar-thumb-primary/10">
        {!filteredPlugins ? (
          <p>No Data Sources match your search query try changing the search</p>
        ) : (
          filteredPlugins.map((ds) => {
            return (
              <div
                key={ds.id}
                className="flex w-full items-center justify-start gap-2"
              >
                <Link
                  className="flex w-[90%] items-center gap-4 overflow-hidden"
                  to={`/${workspaceId}/datasources/${ds.id}`}
                >
                  <Avatar className="mr-2">
                    <AvatarImage src={ds.dataSource.image ?? undefined} />
                    <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
                  </Avatar>
                  <p className="line-clamp-1">{ds.name}</p>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                      className: 'ml-auto',
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
          })
        )}
      </div>
    </div>
  );
}

export function DataSourceView() {
  // i want to disable the submit  button, but i'm not in the mood to supply submitting state through context to the form and all that so i'll do it the easy way and replace the submit button
  // ref to call the form submit
  const rjsfRef = useRef<FormT>(null);
  const { datasourceId, workspaceId } = useParams();
  const { data, isPending, isError, error } = api.dataSources.one.useQuery(
    +(workspaceId as string),
    +(datasourceId as string),
  );
  const { mutate: updateMutate, isPending: isSubmitting } =
    api.dataSources.update.useMutation();

  if (isPending) {
    // TODO: make the loader inside the template
    return <WebloomLoader />;
  } else if (isError) {
    throw error;
  }

  return (
    <div className="flex w-full flex-col gap-5 p-4">
      <div className="flex gap-5">
        {/*TODO: enable chaning ds name*/}
        <Input defaultValue={data.name} />
      </div>
      <ScrollArea className="h-full w-full ">
        <RJSFShadcn
          ref={rjsfRef}
          schema={data.dataSource.config.schema}
          uiSchema={data.dataSource.config.uiSchema}
          formData={data.config}
          validator={validator}
          onSubmit={({ formData }) => {
            console.log('submit', formData);
            if (!workspaceId || !datasourceId)
              throw new Error(
                "that's weird this function should run under workspaceId, datasourceId",
              );
            updateMutate({
              workspaceId: +workspaceId,
              dataSourceId: +datasourceId,
              dto: {
                config: formData,
              },
            });
          }}
        >
          <Button className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <SaveIcon /> Saving...
              </>
            ) : (
              <>
                <SaveIcon /> Save
              </>
            )}
          </Button>
        </RJSFShadcn>
      </ScrollArea>
    </div>
  );
}

function DataSourcesSidebar() {
  // const { workspaceId } = useParams();

  return (
    <div className="flex h-full flex-col gap-4 bg-primary/10 p-4 md:w-[25%] lg:w-[15%]">
      <h1 className="text-3xl">Data Sources</h1>
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
      <Separator />
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
