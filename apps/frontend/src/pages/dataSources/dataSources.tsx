import { api } from '@/api';
import { SelectWorkSpace } from '@/components/selectWorkspace';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/utils/avatar';
import { Delete } from 'lucide-react';
import { useParams } from 'react-router-dom';

function DataSourcesView() {
  const dataSources = api.globalDataSource.index.useQuery();

  if (dataSources.isPending) {
    return <div>Loading...</div>;
  } else if (dataSources.isError) {
    throw dataSources.error;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-3">
      <Input placeholder="Search" type="search" />
      <ScrollArea className="h-full w-full">
        <div className="flex flex-wrap justify-between gap-6 ">
          {dataSources.data.map((ds) => {
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
                <Button size={'sm'} variant={'outline'}>
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
  const dss = api.dataSources.index.useQuery(+(workspaceId as string));

  if (dss.isPending) {
    return <div>Loading...</div>;
  } else if (dss.isError) {
    throw dss.error;
  }

  return (
    <ScrollArea>
      {dss.data.map((ds) => {
        return (
          <div key={ds.id} className="flex gap-2">
            <Avatar className="mr-2">
              {/**TODO: add image */}
              <AvatarImage src={undefined} />
              <AvatarFallback>{getInitials(ds.name)}</AvatarFallback>
            </Avatar>
            <p>{ds.name}</p>
            <Button variant={'destructive'} size={'icon'}>
              <Delete />
            </Button>
          </div>
        );
      })}
    </ScrollArea>
  );
}

const dataSourceFilter = [
  {
    name: 'all',
    q: '',
  },
  {
    name: 'databases',
    q: 'databases',
  },
  {
    name: 'APIs',
    q: 'api',
  },
  {
    name: 'Cloud Storage',
    q: 'storage',
  },
  {
    name: 'Plugin',
    q: 'plugin',
  },
];

export function DataSourcesLayout() {
  return (
    <div className="flex h-full w-full">
      {/**
       * sidebar
       */}
      <div className="bg-primary/10 flex h-full w-1/4 min-w-[15%] flex-col">
        <h2 className="ml-2 text-3xl">Data Sources</h2>
        {/** plugins filter*/}
        <ScrollArea className="">
          <h4>Filters</h4>
          {dataSourceFilter.map((ds, i) => {
            return (
              <Button key={ds.q + i} variant={'link'} className="block">
                {ds.name}
              </Button>
            );
          })}
        </ScrollArea>
        <Separator />
        {/** configured plugins*/}
        <h4>plugins</h4>
        <Input placeholder="Search" type="search" />
        <WorkspaceDataSourcesView />
        <div className="mt-auto">
          <SelectWorkSpace />
        </div>
      </div>
      <DataSourcesView />
    </div>
  );
}
