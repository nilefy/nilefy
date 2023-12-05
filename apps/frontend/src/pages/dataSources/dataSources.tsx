import { api } from '@/api';
import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/utils/avatar';
import { Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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

function DataSourcesView() {
  const { workspaceId } = useParams();
  const { mutate } = api.dataSources.insert.useMutation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPending, isError, error, data } =
    api.globalDataSource.index.useQuery();
  const filteredDataSources = useMemo(() => {
    if (!data) {
      return;
    }
    const filter = searchParams.get('filter');
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
          setSearchParams((prev) => {
            const s = new URLSearchParams(prev);
            s.set('gsearch', value.toString());
            return s;
          });
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
                <Button
                  size={'sm'}
                  variant={'outline'}
                  onClick={() => {
                    if (!workspaceId) throw new Error('must have workspaceId');
                    mutate({
                      workspaceId: +workspaceId,
                      globalDataSourceId: ds.id,
                      dto: { name: 'new name', config: {} },
                    });
                  }}
                >
                  Add
                </Button>
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
          setSearchParams((prev) => {
            const s = new URLSearchParams(prev);
            s.set('lsearch', value.toString());
            return s;
          });
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
                <Avatar className="mr-2">
                  {/**TODO: add image */}
                  <AvatarImage src={undefined} />
                  <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
                </Avatar>
                <p>{ds.name}</p>
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
                          console.log('in delete');
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

export function DataSourcesLayout() {
  const [_searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="flex h-full w-full">
      {/**
       * sidebar
       */}
      <div className="bg-primary/10 flex h-full w-1/4 min-w-[15%] flex-col">
        <h2 className="ml-2 text-3xl">Data Sources</h2>
        {/** plugins filter*/}
        <ScrollArea className="h-full">
          <h4>Filters</h4>
          {dataSourceFilter.map((ds, i) => {
            return (
              <Button
                onClick={() => setSearchParams({ filter: ds.q })}
                key={ds.q + i}
                variant={'link'}
                className="block"
              >
                {ds.name}
              </Button>
            );
          })}
        </ScrollArea>
        <Separator />
        {/** configured plugins*/}
        <h4>plugins</h4>
        <WorkspaceDataSourcesView />
        <div className="mt-auto">
          <SelectWorkSpace />
        </div>
      </div>
      <DataSourcesView />
    </div>
  );
}
