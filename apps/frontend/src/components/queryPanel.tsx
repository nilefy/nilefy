import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import {
  Filter,
  Maximize2,
  Minimize2,
  Search,
  Trash,
  Pencil,
  Copy,
} from 'lucide-react';
import { nanoid } from 'nanoid';
const initialData = [
  {
    id: nanoid(),
    name: 'Item 1',
    source: 'Source A',
    dateModified: new Date('2023-01-01'),
  },
  {
    id: nanoid(),
    name: 'Item 2',
    source: 'Source B',
    dateModified: new Date('2023-01-02'),
  },
  {
    id: nanoid(),
    name: 'Item 3',
    source: 'Source A',
    dateModified: new Date('2023-01-03'),
  },
];
type Query = {
  id: string;
  name: string;
  source: string;
  dateModified: Date;
};
const _dataSources = [
  {
    name: 'Data Source 1',
    icon: 'https://picsum.photos/200',
    type: 'Source A',
  },
  {
    name: 'Data Source 2',
    icon: 'https://picsum.photos/200',
    type: 'Source B',
  },
] as const;
type DataSourceTypes = (typeof _dataSources)[number]['type'];
export function QueryPanel() {
  const [open, setOpen] = useState(false);
  //todo: temp until backend is finished
  const [queries, setQueries] = useState<Array<Query>>(() => [
    {
      id: nanoid(),
      name: 'Item 1',
      source: 'Source A',
      dateModified: new Date('2023-01-01'),
    },
    {
      id: nanoid(),
      name: 'Item 2',
      source: 'Source B',
      dateModified: new Date('2023-01-02'),
    },
    {
      id: nanoid(),
      name: 'Item 4',
      source: 'Source A',
      dateModified: new Date('2023-01-03'),
    },
  ]);
  const [dataSourceSearch, setDataSourceSearch] = useState('');
  const [querySearch, setQuerySearch] = useState('');
  const [dataSources] = useState(_dataSources);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<DataSourceTypes | 'all'>(
    'all',
  );
  const [sortingCriteria, setSortingCriteria] = useState('');
  const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');

  const handleDataSourceSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const query = event.target.value.toLowerCase();
    setDataSourceSearch(query);
  };

  const addItem = (newItem: {
    id: string;
    name: string;
    source: string;
    dateModified: Date;
  }) => {
    setQueries((prevData) => [...prevData, newItem]);
  };

  const deleteItem = (itemId: string) => {
    setQueries((prevData) => prevData.filter((item) => item.id !== itemId));
  };

  const renameItem = (
    item: { id: string; name: string; source: string; dateModified: Date },
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newName = e.target.value;
    setQueries((prevData) =>
      prevData.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, name: newName, dateModified: new Date() }
          : prevItem,
      ),
    );
  };

  const duplicateItem = (item: {
    id: string;
    name: string;
    source: string;
    dateModified: Date;
  }) => {
    if (item) {
      const newItem = {
        id: nanoid(),
        name: `Copy of ${item.name}`,
        source: item.source,
        dateModified: new Date(),
      };
      setQueries((prevData) => [...prevData, newItem]);
    }
  };

  const handleItemClick = (itemId: string) => {
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
      if (sortingCriteria === 'name' || sortingCriteria === 'source') {
        sortedData.sort((a, b) => {
          const aValue = a[sortingCriteria].toLowerCase();
          const bValue = b[sortingCriteria].toLowerCase();
          return sortingOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      } else if (sortingCriteria === 'dateModified') {
        sortedData.sort((a, b) => {
          const aValue = a.dateModified.getTime();
          const bValue = b.dateModified.getTime();
          return sortingOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
      }
      return sortedData;
    },
    [],
  );

  const queriesToShow = useMemo(() => {
    const sorted = sortQueries(queries, sortingCriteria, sortingOrder);
    const filtered = matchSorter(sorted, querySearch, {
      keys: ['name', 'source'],
    }).filter((item) => {
      if (selectedSource === 'all' || item.source === selectedSource) {
        return item;
      }
    });
    return filtered;
  }, [
    queries,
    selectedSource,
    querySearch,
    sortingOrder,
    sortingCriteria,
    sortQueries,
  ]);
  const dataSourcesToShow = useMemo(() => {
    return matchSorter(dataSources, dataSourceSearch, {
      keys: ['name', 'type'],
    });
  }, [dataSources, dataSourceSearch]);
  return (
    <Sheet key={'buttom'} open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger className="absolute bottom-2 left-16">
        <Maximize2 className="relative h-4 w-4 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent
        side={'bottom'}
        className="left-16  w-4/5 p-0"
        id="myResizableDiv"
        style={{ height: `${400}px` }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="h-1 w-full "></div>
        <div className="flex h-full w-full flex-row pb-4 ">
          <div className="flex w-1/3 flex-col border-r border-gray-300">
            <div className="flex h-10 flex-row justify-between border-b border-gray-300 px-2 pb-2">
              <div className="flex flex-row items-center gap-x-2">
                <SheetClose asChild>
                  <Minimize2
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </SheetClose>
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
                          setSelectedSource(e as DataSourceTypes | 'all');
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Data Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {dataSources.map((dataSource) => (
                            <SelectItem
                              key={dataSource.type}
                              value={dataSource.type}
                            >
                              {dataSource.type}
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
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" className="h-8">
                    + Add
                  </Button>
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
                  {dataSourcesToShow.map((item) => (
                    <DropdownMenuItem
                      key={item.type}
                      onClick={() => {
                        const newItem = {
                          id: nanoid(),
                          //todo: handle name collisions (hadhoud)
                          name: item.name,
                          source: item.type,
                          dateModified: new Date(),
                        };
                        addItem(newItem);
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
                  <div className="flex items-center justify-between border-b border-gray-300 py-1">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={querySearch}
                      onChange={(e) => {
                        setQuerySearch(e.target.value);
                      }}
                      className="h-6 w-2/3 rounded-md border border-gray-300"
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
                {queriesToShow.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className={`cursor-pointer ${
                      selectedItemId === item.id ? 'bg-gray-200' : ''
                    } my-2 flex h-6 w-full items-center justify-start`}
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={() => setIsHovered(item.id)}
                    onMouseLeave={() => setIsHovered(null)}
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
                        <div className="flex justify-between">
                          <p>{item.name}</p>
                          {selectedItemId === item.id &&
                            isHovered === item.id && (
                              <div>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="ml-2"
                                >
                                  <Trash size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingItemId(item.id)}
                                  className="ml-2"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => duplicateItem(item)}
                                  className="ml-2"
                                >
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
          <div className="flex w-full flex-col border-r border-gray-300">
            <div className="flex h-10 flex-row justify-between border-b border-gray-300 pb-2">
              <div className="flex flex-row "></div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
