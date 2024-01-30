import validator from '@rjsf/validator-ajv8';
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
import { CompeleteQueryI } from '@/api/queries.api';
import { DebouncedInput } from './debouncedInput';
import clsx from 'clsx';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';
import FormT from '@rjsf/core';
import { RJSFShadcn } from './rjsf_shad';

function QueryItem({ query }: { query?: CompeleteQueryI }) {
  const rjsfRef = useRef<FormT>(null);
  const { workspaceId, appId } = useParams();
  const queryClient = useQueryClient();

  const { mutate: updateMutation, isPending: isSubmitting } =
    api.queries.update.useMutation({
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['queries'] });
      },
    });
  const { mutate: run } = api.queries.run.useMutation({
    onSuccess(data, variables) {
      console.log(
        '🪵 [queryPanel.tsx:32] ~ token ~ \x1b[0;32mvariables\x1b[0m = ',
        variables,
      );
      console.log(
        '🪵 [queryPanel.tsx:32] ~ token ~ \x1b[0;32mdata\x1b[0m = ',
        data,
      );
    },
  });

  if (!query) {
    return (
      <div className="h-full w-full flex-row items-center justify-center border border-gray-300">
        <p>create new query!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {/* HEADER */}
      <div className="flex h-10 flex-row items-center justify-end gap-5 border border-gray-300">
        <Input defaultValue={query.name} />
        <Button className="mr-auto" onClick={() => rjsfRef.current?.submit()}>
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
            // TODO: the evaluatedConfige should be eval(query.query, context)
            const evaluatedConfig = query.query;
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
        <RJSFShadcn
          ref={rjsfRef}
          // formContext={{ isSubmitting: isSubmitting }}
          schema={query.dataSource.dataSource.queryConfig.schema}
          uiSchema={query.dataSource.dataSource.queryConfig.uiSchema}
          formData={query.query}
          validator={validator}
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
              },
            });
          }}
        >
          {/*to remove submit button*/}
          <></>
        </RJSFShadcn>
      </ScrollArea>
    </div>
  );
}

export function QueryPanel() {
  const [querieNumber, setQueryNumber] = useState(0);
  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortingCriteria, setSortingCriteria] = useState<
    'name' | 'source' | 'dateModified'
  >('name');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');
  const { workspaceId, appId } = useParams();

  const { data: dataSources } = api.dataSources.index.useQuery(
    +(workspaceId as string),
  );
  const { data: queries, refetch: refetchQueries } = api.queries.index.useQuery(
    +(workspaceId as string),
    +(appId as string),
  );
  const { mutate: addMutation } = api.queries.insert.useMutation({
    onSuccess: () => {
      refetchQueries();
    },
  });
  const { mutate: deleteMutation } = api.queries.delete.useMutation({
    onSuccess: () => {
      refetchQueries();
    },
  });

  const uniqueDataSourceTypes = Array.from(
    new Set(dataSources?.map((dataSource) => dataSource.dataSource.type)),
  );

  // const renameItem = (item: QueryI, e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newName = e.target.value;
  //   updateMutation({
  //     workspaceId,
  //     appId,
  //     queryId: item.dataSource.id,
  //     id: item.id,
  //     data: { name: newName, query: item.query },
  //   });
  // };

  // const duplicateItem = (item: Query) => {
  //   if (item) {
  //     const newItem = {
  //       name: `Copy of ${item.name}`,
  //       query: item.query,
  //     };
  //     addMutation({
  //       workspaceId,
  //       appId,
  //       dataSourceId: item.dataSource.id,
  //       query: newItem,
  //     });
  //   }
  // };

  const handleItemClick = (itemId: number) => {
    setSelectedItemId((prevSelectedItemId) =>
      prevSelectedItemId === itemId ? null : itemId,
    );
  };

  const sortQueries = useCallback(
    (
      queries: CompeleteQueryI[],
      sortingCriteria: 'name' | 'dateModified' | 'source',
      sortingOrder: 'asc' | 'desc' | null,
    ) => {
      const sortedData = [...queries];

      if (sortingCriteria === 'name') {
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

  const filtredQueries = useMemo(() => {
    if (queries) {
      const temp = sortQueries(queries, sortingCriteria, sortingOrder).filter(
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
        keys: ['name', 'type'],
      });
      if (res.length > 0) {
        setSelectedItemId(res[0].id);
      }
      return res;
    } else {
      setSelectedItemId(null);
      return [];
    }
  }, [
    queries,
    selectedSource,
    querySearch,
    sortingOrder,
    sortingCriteria,
    sortQueries,
  ]);

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
                    setSortingCriteria('name');
                    setSortingOrder('asc');
                  }}
                >
                  Name : A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSortingCriteria('name');
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
                <DropdownMenuItem
                  key={item.dataSource.type}
                  onClick={() => {
                    // TODO: change to use same logic as widgets in main
                    setQueryNumber(querieNumber + 1);
                    if (!workspaceId || !appId) throw new Error();
                    addMutation({
                      workspaceId: +workspaceId,
                      appId: +appId,
                      dto: {
                        dataSourceId: item.id,
                        name: item.name + querieNumber,
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
            {filtredQueries?.map((item) => (
              <li className="flex w-full " key={item.id}>
                {editingItemId === item.id ? (
                  <Input
                    type="text"
                    value={item.name}
                    // onChange={(e) => renameItem(item, e)}
                    autoFocus
                    onBlur={() => setEditingItemId(null)}
                  />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className={clsx({
                        'group cursor-pointer my-2 flex h-6 w-full items-center justify-start p-4 border-0 hover:bg-primary/5':
                          true,
                        'bg-primary/10': selectedItemId === item.id,
                      })}
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.name}
                    </Button>
                    <Button
                      size={'icon'}
                      variant={'ghost'}
                      onClick={() => setEditingItemId(item.id)}
                    >
                      <Pencil size={16} />
                    </Button>
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
      <div className="h-full w-full">
        <QueryItem query={queries?.find((q) => q.id === selectedItemId)} />
      </div>
    </div>
  );
}
