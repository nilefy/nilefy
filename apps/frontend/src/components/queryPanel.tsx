import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Filter, Search, Trash, Pencil, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useParams } from 'react-router-dom';
import { ConfigForm } from './configForm';
import { api } from '@/api';
import { GlobalDataSourceI, WsDataSourceI } from '@/api/dataSources.api';

type Query = {
  id: number;
  name: string;
  query: object;
  dataSource: {
    id: number;
    name: string;
    dataSource: {
      queryConfig: [];
      id: number;
      type: string;
      name: string;
    };
  };
};

type DataSourceTypes = (Pick<WsDataSourceI, 'id' | 'name' | 'workspaceId'> & {
  dataSource: Pick<GlobalDataSourceI, 'id' | 'name' | 'image' | 'type'>;
})[];

export function QueryPanel() {
  const [queries, setQueries] = useState<Array<Query>>();
  const [querieNumber, setQueryNumber] = useState(0);
  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [dataSources, setDataSources] = useState<DataSourceTypes>();
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortingCriteria, setSortingCriteria] = useState<
    'name' | 'source' | 'dateModified'
  >('name');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');
  const { workspaceId, appId } = useParams();

  const { isPending, data } = api.dataSources.index.useQuery(
    +(workspaceId as string),
  );
  const {
    isPending: queryPending,
    data: queryData,
    refetch: refetchQueries,
  } = api.queries.index.useQuery(
    +(workspaceId as string),
    1,
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
  const { mutate: updateMutation } = api.queries.update.useMutation({
    onSuccess: () => {
      refetchQueries();
    },
  });

  useEffect(() => {
    if (data && !isPending) {
      setDataSources(data);
      console.log(data);
    }
    if (queryData && !queryPending) {
      setQueries(queryData);
    }
  }, [queryData, data, queryPending, isPending]);
  const uniqueDataSourceTypes = Array.from(
    new Set(dataSources?.map((dataSource) => dataSource.dataSource.type)),
  );

  const handleDataSourceSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = event.target.value.toLowerCase();
    setDataSourceSearch(query);
  };

  const renameItem = (item: Query, e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    updateMutation({
      workspaceId,
      appId,
      dataSourceId: item.dataSource.id,
      id: item.id,
      data: { name: newName, query: item.query },
    });
  };

  const duplicateItem = (item: Query) => {
    if (item) {
      const newItem = {
        name: `Copy of ${item.name}`,
        query: item.query,
      };
      addMutation({
        workspaceId,
        appId,
        dataSourceId: item.dataSource.id,
        query: newItem,
      });
    }
  };

  const handleItemClick = (itemId: number) => {
    setSelectedItemId((prevSelectedItemId) =>
      prevSelectedItemId === itemId ? null : itemId,
    );
  };

  const sortQueries = useCallback(
    (
      queries: Query[],
      sortingCriteria: string,
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

  const queriesToShow = useMemo(() => {
    if (queries && !queryPending) {
      const filtered = matchSorter(queries, querySearch, {
        keys: ['name', 'type'],
      }).filter((item) => {
        if (
          selectedSource === 'all' ||
          item.dataSource.dataSource.type === selectedSource
        ) {
          return item;
        }
      });
      return sortQueries(filtered, sortingCriteria, sortingOrder);
    }
  }, [
    queries,
    selectedSource,
    querySearch,
    sortingOrder,
    sortingCriteria,
    sortQueries,
    queryPending,
  ]);
  const dataSourcesToShow = useMemo(() => {
    if (dataSources && !isPending) {
      return matchSorter(dataSources, dataSourceSearch, {
        keys: ['name', 'type'],
      });
    }
  }, [dataSources, dataSourceSearch, isPending]);
  return (
    <div className="h-full w-full">
      <div className="h-1 w-full "></div>
      <div className="flex h-full w-full   flex-row border border-gray-300 pb-4 ">
        <div className="flex w-1/3 flex-col border-gray-300">
          <div className="flex h-10 flex-row items-center justify-between border-b border-gray-300 p-4">
            <div className="flex flex-row items-center gap-x-2">
              <Search
                className="h-4 w-4 cursor-pointer"
                onClick={() => setCloseSearsh(true)}
              />
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
                        {uniqueDataSourceTypes?.map((type) => (
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
                  {/* 
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setSortingCriteria('dateModified');
                      setSortingOrder('asc');
                    }}
                  >
                    Last Modified : Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setSortingCriteria('dateModified');
                      setSortingOrder('desc');
                    }}
                  >
                    Last Modified : Newest First
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="h-8">+ Add</div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={dataSourceSearch}
                    onChange={(e) => handleDataSourceSearchChange(e)}
                    className=" mb-4 rounded-md border border-gray-300 p-2"
                  />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dataSourcesToShow?.map((item) => (
                  <DropdownMenuItem
                    key={item.dataSource.type}
                    onClick={() => {
                      setQueryNumber(querieNumber + 1);
                      const query = {
                        name: item.name + querieNumber,
                        query: {},
                      };
                      console.log(item.id, 'jlj');
                      const dataSourceId: number = item.id;
                      addMutation({ workspaceId, appId, dataSourceId, query });
                    }}
                  >
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-2">
            <ul>
              {closeSearsh && (
                <div className="flex items-center justify-between border-b border-gray-300">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={querySearch}
                    onChange={(e) => {
                      setQuerySearch(e.target.value);
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
              {queriesToShow?.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className={cn(
                    'group cursor-pointer my-2 flex h-6 w-full items-center justify-start p-4 border-0 hover:bg-gray-200',
                    {
                      'bg-blue-100': selectedItemId === item.id,
                    },
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <li className="w-full">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => renameItem(item, e)}
                        autoFocus
                        onBlur={() => setEditingItemId(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {selectedItemId === item.id && (
                          <div className="invisible flex items-center justify-center gap-2 group-hover:visible ">
                            <button
                              onClick={() => {
                                console.log('delete');
                                setQueryNumber(querieNumber - 1);
                                deleteMutation({
                                  workspaceId,
                                  appId,
                                  dataSourceId: item.dataSource.id,
                                  id: item.id,
                                });
                              }}
                            >
                              <Trash size={16} />
                            </button>
                            <button onClick={() => setEditingItemId(item.id)}>
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => duplicateItem(item)}>
                              <Copy size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                </Button>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex w-full flex-col border border-r-0 border-t-0 border-gray-300 ">
          <div className="flex h-10 flex-row justify-between border-b border-gray-300 pb-2">
            <div className="flex flex-row ">
              <ConfigForm
                config={[
                  {
                    sectionName: 'Development',
                    children: [
                      {
                        id: 'host',
                        key: 'host',
                        label: 'Host',
                        type: 'input',
                        options: {
                          placeholder: 'localhost',
                          type: 'text',
                        },
                      },
                      {
                        id: 'port',
                        key: 'port',
                        label: 'Port',
                        type: 'input',
                        options: {
                          placeholder: '5000',
                          type: 'number',
                        },
                      },
                      {
                        id: 'ssl',
                        key: 'ssl',
                        label: 'SSL',
                        type: 'input',
                        options: {},
                      },
                      {
                        id: 'database_name',
                        key: 'database',
                        label: 'Database Name',
                        type: 'input',
                        options: {
                          placeholder: 'Name of the database',
                          type: 'text',
                        },
                      },
                      {
                        id: 'username',
                        key: 'user',
                        label: 'Username',
                        type: 'input',
                        options: {
                          placeholder: 'Enter username',
                          type: 'text',
                        },
                      },
                      {
                        id: 'password',
                        key: 'password',
                        label: 'Password',
                        type: 'input',
                        options: {
                          placeholder: 'Enter password',
                          type: 'password',
                        },
                      },
                      {
                        id: 'certificate',
                        key: 'sslCertificate',
                        label: 'SSL Certificate',
                        type: 'select',
                        options: {
                          items: [
                            {
                              label: 'CA Certificate',
                              value: 'ca',
                            },
                            {
                              label: 'Self-signed Certificate',
                              value: 'self-signed',
                            },
                            {
                              label: 'None',
                              value: 'none',
                            },
                          ],
                          placeholder: 'None',
                        },
                      },
                      // TODO: add connection options key-value pairs
                    ],
                  },
                ]}
                itemProps={{}}
                onChange={(key, value) => {
                  console.log(key, value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
