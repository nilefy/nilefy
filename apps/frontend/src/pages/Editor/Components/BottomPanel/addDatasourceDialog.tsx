import { DebouncedInput } from '@/components/debouncedInput';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials } from '@/utils/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import { matchSorter } from 'match-sorter';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const DataSources = () => {
  const data = {} as GlobalDataSourceIndexRet;
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
};
