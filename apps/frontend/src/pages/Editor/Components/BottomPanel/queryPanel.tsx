import { useState, useMemo, useCallback, useRef, forwardRef } from 'react';
import { matchSorter } from 'match-sorter';
import ReactJson from 'react-json-view';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Search, Trash, Pencil, SaveIcon, Play } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/api';
import { DebouncedInput } from '../../../../components/debouncedInput';
import clsx from 'clsx';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { editorStore } from '@/lib/Editor/Models';
import { QueryRawValues, WebloomQuery } from '@/lib/Editor/Models/query';
import { observer } from 'mobx-react-lite';
import { computed } from 'mobx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNewEntityName } from '@/lib/Editor/entitiesNameSeed';
import { Label } from '@/components/ui/label';
import { DefaultSection, EntityForm } from '../entityForm';
export const QueryConfigPanel = observer(({ id }: { id: string }) => {
  const query = editorStore.getEntityById(id)!;
  return (
    <div>
      <EntityForm>
        {query.inspectorConfig.map((section) => {
          return (
            <DefaultSection
              key={section.sectionName}
              section={section}
              selectedId={id}
            />
          );
        })}
      </EntityForm>
    </div>
  );
});

import { LoadingButton } from '@/components/loadingButton';

const QueryPreview = observer<{ queryValues: QueryRawValues }, HTMLDivElement>(
  forwardRef(function QueryPreview(props, ref) {
    return (
      <Tabs
        ref={ref}
        defaultValue="json"
        className="max-w-full overflow-x-hidden"
      >
        <TabsList className="w-full space-x-8 p-2">
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
        <TabsContent
          value="json"
          className="text-md bg-muted h-full w-full min-w-full max-w-full leading-relaxed"
        >
          <ReactJson
            theme={'twilight'}
            src={
              props.queryValues.error
                ? { error: props.queryValues.error }
                : (props.queryValues.data as object)
            }
          />
        </TabsContent>
        <TabsContent
          className="text-md bg-muted h-full w-full min-w-full max-w-full leading-relaxed"
          value="raw"
        >
          {JSON.stringify(
            props.queryValues.error ?? props.queryValues.data,
            null,
            3,
          )}
        </TabsContent>
      </Tabs>
    );
  }),
);

const QueryItem = observer(function QueryItem({
  query,
}: {
  query: WebloomQuery;
}) {
  const jsonResultRef = useRef<HTMLDivElement>(null);
  const { workspaceId, appId } = useParams();
  const { data: dataSources } = api.dataSources.index.useQuery({
    workspaceId: +(workspaceId as string),
  });
  const [curDataSource, setCurDataSource] = useState<string>(() =>
    query.dataSource.id.toString(),
  );

  return (
    <div className="h-full w-full">
      {/* HEADER */}
      <div className="flex h-10 flex-row items-center gap-5 border-b border-gray-300 px-3 py-1 ">
        {/* TODO: if this input is supposed to be used for renaming the query, is it good idea to have the same functionlity in two places */}
        <Input
          defaultValue={query.id}
          className="h-4/5 w-1/5 border-gray-200 transition-colors hover:border-blue-400"
        />
        <div className="ml-auto flex flex-row items-center">
          <LoadingButton
            isLoading={editorStore.queriesManager.updateQuery.state.isPending}
            buttonProps={{
              variant: 'ghost',
              type: 'button',
              className: 'mr-auto',
              onClick: () => {
                editorStore.queriesManager.updateQuery.mutate({
                  workspaceId: +workspaceId!,
                  appId: +appId!,
                  queryId: query.id,
                  dto: {
                    query: query.rawConfig as Record<string, unknown>,
                    dataSourceId: +curDataSource,
                  },
                });
              },
            }}
          >
            <>
              <SaveIcon /> Save
            </>
          </LoadingButton>
          <Button
            variant={'ghost'}
            disabled={query.queryRunner.state.isPending}
            onClick={() => {
              if (!workspaceId || !appId) {
                throw new Error('workspaceId or appId is not defined!');
              }
              query.queryRunner.mutate();
            }}
          >
            <Play /> run
          </Button>
        </div>
      </div>
      {/*FORM*/}
      <ScrollArea className="h-[calc(100%-3rem)] w-full ">
        <div className="flex flex-col gap-4 p-4">
          <Label className="flex items-center gap-4">
            Data Source
            <Select
              value={curDataSource}
              onValueChange={(e) => {
                setCurDataSource(e);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={query?.dataSource.name} />
              </SelectTrigger>
              <SelectContent>
                {dataSources
                  ?.filter(
                    (dataSource) =>
                      dataSource.dataSource.name ===
                      query.dataSource.dataSource.name,
                  )
                  .map((dataSource) => (
                    <SelectItem
                      key={dataSource.name}
                      value={dataSource.id.toString()}
                    >
                      {dataSource.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Label>
          <QueryConfigPanel id={query.id} />

          <QueryPreview
            ref={jsonResultRef}
            key={query.id + 'preview'}
            queryValues={query.rawValues as QueryRawValues}
          />
        </div>
      </ScrollArea>
    </div>
  );
});

export const QueryPanel = observer(function QueryPanel() {
  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortingCriteria, setSortingCriteria] = useState<
    'id' | 'source' | 'dateModified'
  >('id');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');
  const { workspaceId, appId } = useParams();

  const { data: dataSources } = api.dataSources.index.useQuery({
    workspaceId: +(workspaceId as string),
  });
  const queries = editorStore.queries;

  const uniqueDataSourceTypes = Array.from(
    new Set(dataSources?.map((dataSource) => dataSource.dataSource.type)),
  );

  /**
   * toggle the selection
   */
  const handleItemClick = (itemId: string) => {
    editorStore.setSelectedQueryId((prevSelectedItemId) =>
      prevSelectedItemId === itemId ? null : itemId,
    );
  };

  const sortQueries = useCallback(
    (
      queries: WebloomQuery[],
      sortingCriteria: 'id' | 'dateModified' | 'source',
      sortingOrder: 'asc' | 'desc' | null,
    ) => {
      const sortedData = [...queries];

      if (sortingCriteria === 'id') {
        sortedData.sort((a, b) => {
          const aValue = a[sortingCriteria].toLowerCase();
          const bValue = b[sortingCriteria].toLowerCase();
          return sortingOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      } else if (sortingCriteria === 'source') {
        sortedData.sort((a, b) => {
          const aValue = a.dataSource.dataSource.type.toLowerCase();
          const bValue = b.dataSource.dataSource.type.toLowerCase();
          return sortingOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      }
      // TODO:
      //  else if (sortingCriteria === 'dateModified') {
      //   sortedData.sort((a, b) => {
      //     const aValue = a.dateModified.getTime();
      //     const bValue = b.dateModified.getTime();
      //     return sortingOrder === 'asc' ? aValue - bValue : bValue - aValue;
      //   });
      // }
      return sortedData;
    },
    [],
  );

  const filteredDatasources = useMemo(() => {
    if (dataSources) {
      return matchSorter(dataSources, dataSourceSearch, {
        keys: ['name', 'type'],
      });
    } else {
      return [];
    }
  }, [dataSources, dataSourceSearch]);

  // check https://github.com/mobxjs/mobx/discussions/3348
  const filteredQueries = useMemo(() => {
    return computed(() => {
      const tempQ = Object.values(queries);
      if (tempQ.length > 0) {
        const temp = sortQueries(tempQ, sortingCriteria, sortingOrder).filter(
          (item) => {
            if (
              selectedSource === 'all' ||
              item.dataSource.dataSource.type === selectedSource
            ) {
              return item;
            }
          },
        );
        const res = matchSorter(temp, querySearch, {
          keys: ['id'],
        });
        if (res.length > 0) {
          editorStore.setSelectedQueryId(res[0].id);
        }
        return res;
      } else {
        editorStore.setSelectedQueryId(null);
        return [];
      }
    });
  }, [
    queries,
    selectedSource,
    querySearch,
    sortingOrder,
    sortingCriteria,
    sortQueries,
  ]).get();

  return (
    <>
      <div className="flex h-full w-1/3 flex-col ">
        {/* SEARCH, FILTER AND ADD*/}
        <div className="flex h-10 w-full items-center justify-between gap-4 border-b p-4">
          {/* SEARCH and FILTER */}
          <div className="flex flex-row items-center gap-x-2">
            <Button
              onClick={() => setCloseSearsh(true)}
              size={'icon'}
              variant={'ghost'}
            >
              <Search className="h-4 w-4 " />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Filter className="h-4 w-4 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Select
                    value={selectedSource}
                    onValueChange={(e) => {
                      setSelectedSource(e);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Data Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {uniqueDataSourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSortingCriteria('id');
                    setSortingOrder('asc');
                  }}
                >
                  Name : A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSortingCriteria('id');
                    setSortingOrder('desc');
                  }}
                >
                  Name : Z-A
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSortingCriteria('source');
                    setSortingOrder('asc');
                  }}
                >
                  Type : A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSortingCriteria('source');
                    setSortingOrder('desc');
                  }}
                >
                  Type : Z-A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ADD QUERY DROP DOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger>+ Add</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <DebouncedInput
                  type="search"
                  placeholder="Search..."
                  value={dataSourceSearch}
                  onChange={(v) => setDataSourceSearch(v.toString())}
                  className=" mb-4 rounded-md border  p-2"
                />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredDatasources.map((item) => (
                // ADD NEW QUERY
                <DropdownMenuItem
                  key={item.dataSource.type}
                  onClick={() => {
                    if (!workspaceId || !appId) throw new Error();
                    editorStore.queriesManager.addQuery.mutate({
                      workspaceId: +workspaceId,
                      appId: +appId,
                      dto: {
                        dataSourceId: item.id,
                        id: getNewEntityName(item.name),
                        query: {},
                      },
                    });
                  }}
                >
                  {item.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link to={`/${workspaceId}/datasources`}>Add New</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="h-full w-full">
          <ul className="h-full w-full overflow-y-auto">
            {closeSearsh && (
              <div className="flex items-center justify-between border-b">
                <DebouncedInput
                  type="text"
                  placeholder="Search..."
                  value={querySearch}
                  onChange={(e) => {
                    setQuerySearch(e.toString());
                  }}
                  className="h-6 w-2/3  rounded-md border"
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCloseSearsh(false);
                  }}
                >
                  close
                </Button>
              </div>
            )}
            {filteredQueries?.map((item) => (
              <li
                className={clsx(
                  { 'bg-primary/10': item.id === editorStore.selectedQueryId },
                  'flex w-full items-center',
                )}
                key={item.id}
              >
                {editingItemId === item.id ? (
                  <Input
                    type="text"
                    value={item.id}
                    className="w-full"
                    // TODO: enable rename
                    // onChange={(e) => renameItem(item, e)}
                    autoFocus
                    onBlur={() => setEditingItemId(null)}
                  />
                ) : (
                  <>
                    <div
                      className="group my-2 flex h-6 w-full cursor-pointer items-center justify-start border-0 p-4"
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.id}
                    </div>
                    <div className="ml-auto flex flex-row items-center gap-x-2">
                      {/* TOGGLE ITEM SELECTION */}

                      <Button
                        size={'icon'}
                        variant={'ghost'}
                        onClick={() => setEditingItemId(item.id)}
                      >
                        <Pencil size={16} />
                      </Button>
                      {/* TODO: enable clone*/}
                      {/* <button onClick={() => duplicateItem(item)}>
                              <Copy size={16} />
                            </button> */}

                      <Button
                        size={'icon'}
                        variant={'ghost'}
                        onClick={() => {
                          if (!workspaceId || !appId) throw new Error();
                          editorStore.queriesManager.deleteQuery.mutate({
                            workspaceId: +workspaceId,
                            appId: +appId,
                            queryId: item.id,
                          });
                        }}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      {/* ITEM */}
      <div className="h-full w-full border-l">
        {editorStore.selectedQueryId ? (
          <QueryItem
            key={queries[editorStore.selectedQueryId].id}
            query={queries[editorStore.selectedQueryId]}
          />
        ) : (
          <div className="h-full w-full flex-row items-center justify-center ">
            <p>select or create new query</p>
          </div>
        )}
      </div>
    </>
  );
});