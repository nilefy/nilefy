import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
type MyType = {
  id: string;
  name: string;
  source: string;
  dateModified: Date;
};

export function QueryPanel() {
  const [open, setOpen] = useState(false);
  const [isResizing, setResizing] = useState(false);
  const [height, setHeight] = useState<number>(300);
  const [startY, setStartY] = useState<number>(0);
  const [initialData2, setInitialData2] = useState<Array<MyType>>([
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);
  const [searchQuery2, setSearchQuery2] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    'all',
  );
  const [sortingCriteria, setSortingCriteria] = useState('');
  const [sortingOrder, setSortingOrder] = useState('');
  const sourceTypes = Array.from(
    new Set(initialData2.map((item) => item.source)),
  ).map((source: string) => source);

  const handleMouseDown = (event: React.MouseEvent) => {
    setResizing(true);
    setStartY(event.clientY);
  };

  const handleMouseUp = () => {
    setResizing(false);
  };
  const handleMouseMove = (event: MouseEvent) => {
    if (isResizing) {
      const resizableDiv = document.getElementById('myResizableDiv');
      if (resizableDiv) {
        const newHeight = height + (startY - event.clientY);

        resizableDiv.style.height = `${newHeight}px`;
        setHeight(newHeight);

        setStartY(event.clientY);
        if (height < 40) {
          setOpen(false);
          setTimeout(() => {
            setHeight(300);
          }, 1000);

          console.log(height);
        }
      }
    }
  };
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isResizing, height, startY]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = initialData.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
    setFilteredData(filtered);
  };

  const addItem = (newItem: {
    id: string;
    name: string;
    source: string;
    dateModified: Date;
  }) => {
    setInitialData2((prevData) => [...prevData, newItem]);
  };

  const deleteItem = (itemId: string) => {
    setInitialData2((prevData) =>
      prevData.filter((item) => item.id !== itemId),
    );
  };

  const renameItem = (
    item: { id: string; name: string; source: string; dateModified: Date },
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newName = e.target.value;
    setInitialData2((prevData) =>
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
      setInitialData2((prevData) => [...prevData, newItem]);
    }
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId((prevSelectedItemId) =>
      prevSelectedItemId === itemId ? null : itemId,
    );
  };

  const sortAndFilterData = useCallback(
    (
      sortingCriteria: string,
      sortingOrder: string,
      selectedSource: string | undefined,
    ) => {
      const sortedData = [...initialData2];
      if (sortingCriteria === 'name' || sortingCriteria === 'source') {
        console.log('jjj');
        sortedData.sort((a, b) => {
          const aValue = a[sortingCriteria].toLowerCase();
          const bValue = b[sortingCriteria].toLowerCase();
          return sortingOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        });
      } else if (sortingCriteria === 'dateModified') {
        console.log('kkk');
        sortedData.sort((a, b) => {
          const aValue = a.dateModified.getTime();
          const bValue = b.dateModified.getTime();
          return sortingOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
      }

      if (selectedSource !== undefined && selectedSource !== 'all') {
        return sortedData.filter((item) => item.source === selectedSource);
      }
      console.log('sorted', sortedData);
      return sortedData;
    },
    [initialData2],
  );

  const dataToBeShown = useMemo(() => {
    console.log(initialData2, 'bla');
    return sortAndFilterData(
      sortingCriteria,
      sortingOrder,
      selectedSource,
    ).filter((item) => item.name.toLowerCase().includes(searchQuery2));
  }, [
    selectedSource,
    searchQuery2,
    sortingOrder,
    sortingCriteria,
    sortAndFilterData,
    initialData2,
  ]);
  return (
    <Sheet key={'buttom'} open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger className="absolute bottom-2 left-16">
        <Maximize2 className="relative h-4 w-4 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent
        side={'bottom'}
        className="left-16  w-4/5 p-0"
        id="myResizableDiv"
        style={{ height: `${height}px` }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div
          className="h-1 w-full cursor-row-resize"
          onMouseDown={handleMouseDown}
        ></div>
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
                          setSelectedSource(e);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Data Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {sourceTypes.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
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
                        setSortingOrder('des');
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
                        setSortingOrder('des');
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
                        setSortingOrder('des');
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
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e)}
                      className="mb-4 rounded-md border border-gray-300 p-2"
                    />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filteredData.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => addItem(item)}
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
                      value={searchQuery2}
                      onChange={(e) =>
                        setSearchQuery2(e.target.value.toLowerCase())
                      }
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
                {dataToBeShown.map((item) => (
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
