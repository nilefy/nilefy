import { useState, useMemo, useCallback, useRef } from 'react';
import { matchSorter } from 'match-sorter';

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
import { Filter, Search, Trash, Pencil, SaveIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/api';
import { DebouncedInput } from '../../../components/debouncedInput';
import clsx from 'clsx';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import FormT from '@rjsf/core';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomQuery } from '@/lib/Editor/Models/query';
import { observer } from 'mobx-react-lite';
import { computed, runInAction } from 'mobx';
import { getNewEntityName } from '@/lib/Editor/widgetName';
import { Label } from '@/components/ui/label';
import EntityForm from '@/components/rjsf_shad/entityForm';

const QueryItem = observer(function QueryItem({
  query,
}: {
  query: WebloomQuery;
}) {
  const rjsfRef = useRef<FormT>(null);
  const { workspaceId, appId } = useParams();
  const { data: dataSources } = api.dataSources.index.useQuery(
    +(workspaceId as string),
  );
  const [curDataSource, setCurDataSource] = useState<string>(() =>
    query.dataSource.id.toString(),
  );
  const { mutate: updateMutation, isPending: isSubmitting } =
    api.queries.update.useMutation({
      onSuccess(data) {
        runInAction(() => {
          query.setQueryState('success');
          query.updateQuery(data);
        });
      },
    });
  const { mutate: run } = api.queries.run.useMutation({
    onSuccess(data) {
      query.setQueryState('success');
      query.updateQuery({
        rawValues: {
          ...data,
        },
      });
    },
  });

  return (
    <div className="h-full w-full">
      {/* HEADER */}
      <div className="flex h-10 flex-row items-center justify-end gap-5 border-b border-gray-300">
        {/* TODO: if this input is supposed to be used for renaming the query, is it good idea to have the same functionlity in two places */}
        <Input defaultValue={query.id} />
        <Button
          type="button"
          className="mr-auto"
          onClick={() => rjsfRef.current?.submit()}
        >
          {isSubmitting ? (
            <>
              Saving... <SaveIcon />{' '}
            </>
          ) : (
            <>
              Save <SaveIcon />
            </>
          )}
        </Button>
        <Button
          onClick={() => {
            if (!workspaceId || !appId) {
              throw new Error('workspaceId or appId is not defined!');
            }
            const evaluatedConfig = query.config;

            query.setQueryState('loading');
            run({
              workspaceId: +workspaceId,
              appId: +appId,
              queryId: query.id,
              body: {
                evaluatedConfig,
              },
            });
          }}
        >
          run
        </Button>
      </div>
      {/*FORM*/}
      <ScrollArea className="h-[calc(100%-3rem)] w-full ">
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
        <EntityForm
          ref={rjsfRef}
          entityId={query.id}
          onSubmit={({ formData }) => {
            if (!workspaceId || !appId)
              throw new Error(
                "that's weird this function should run under workspaceId, appId",
              );

            updateMutation({
              workspaceId: +workspaceId,
              appId: +appId,
              queryId: query.id,
              dto: {
                query: formData,
                dataSourceId: +curDataSource,
              },
            });
          }}
        />
      </ScrollArea>
    </div>
  );
});

export const QueryPanel = observer(function QueryPanel() {
  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortingCriteria, setSortingCriteria] = useState<
    'id' | 'source' | 'dateModified'
  >('id');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');
  const { workspaceId, appId } = useParams();

  const { data: dataSources } = api.dataSources.index.useQuery(
    +(workspaceId as string),
  );
  const queries = editorStore.queries;
  const { mutate: addMutation } = api.queries.insert.useMutation({
    onSuccess: (data) => {
      editorStore.addQuery(data);
    },
  });
  const { mutate: deleteMutation } = api.queries.delete.useMutation({
    onSuccess: ({ id }) => {
      setSelectedItemId(null);
      editorStore.removeQuery(id);
    },
  });

  const uniqueDataSourceTypes = Array.from(
    new Set(dataSources?.map((dataSource) => dataSource.dataSource.type)),
  );

  /**
   * toggle the selection
   */
  const handleItemClick = (itemId: string) => {
    setSelectedItemId((prevSelectedItemId) =>
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
          setSelectedItemId(res[0].id);
        }
        return res;
      } else {
        setSelectedItemId(null);
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
    <div className="flex h-full w-full border border-gray-300">
      {/* LEFT SIDE */}
      <div className="flex h-full w-1/3 flex-col">
        {/* SEARCH, FILTER AND ADD*/}
        <div className="flex h-10 w-full items-center justify-between gap-4 border-b border-gray-300 p-4">
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
                  className=" mb-4 rounded-md border border-gray-300 p-2"
                />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredDatasources.map((item) => (
                // ADD NEW QUERY
                <DropdownMenuItem
                  key={item.dataSource.type}
                  onClick={() => {
                    if (!workspaceId || !appId) throw new Error();
                    addMutation({
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
              <div className="flex items-center justify-between border-b border-gray-300">
                <DebouncedInput
                  type="text"
                  placeholder="Search..."
                  value={querySearch}
                  onChange={(e) => {
                    setQuerySearch(e.toString());
                  }}
                  className="h-6 w-2/3  rounded-md border border-gray-300"
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
              <li className="flex w-full " key={item.id}>
                {editingItemId === item.id ? (
                  <Input
                    type="text"
                    value={item.id}
                    // TODO: enable rename
                    // onChange={(e) => renameItem(item, e)}
                    autoFocus
                    onBlur={() => setEditingItemId(null)}
                  />
                ) : (
                  <>
                    {/* TOGGLE ITEM SELECTION */}
                    <Button
                      variant="outline"
                      className={clsx({
                        'group cursor-pointer my-2 flex h-6 w-full items-center justify-start p-4 border-0 hover:bg-primary/5':
                          true,
                        'bg-primary/10': selectedItemId === item.id,
                      })}
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.id}
                    </Button>
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
                        deleteMutation({
                          workspaceId: +workspaceId,
                          appId: +appId,
                          queryId: item.id,
                        });
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      {/* ITEM */}
      <div className="h-full w-full border border-gray-300">
        {selectedItemId ? (
          <QueryItem query={queries[selectedItemId]} />
        ) : (
          <div className="h-full w-full flex-row items-center justify-center ">
            <p>select or create new query</p>
          </div>
        )}
      </div>
    </div>
  );
});
