import { useEffect, useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
  Ghost,
} from 'lucide-react';
const initialData = [
  {
    id: 1,
    name: 'Item 1',
    source: 'Source A',
    dateModified: new Date('2023-01-01'),
  },
  {
    id: 2,
    name: 'Item 2',
    source: 'Source B',
    dateModified: new Date('2023-01-02'),
  },
  {
    id: 3,
    name: 'Item 3',
    source: 'Source A',
    dateModified: new Date('2023-01-03'),
  },
];
type MyType = {
  id: number;
  name: string;
  source: string;
  dateModified: Date;
};

export function QueryPanel() {
  const [open, setOpen] = useState(false);
  const [check, setChceck] = useState(false);
  const [isResizing, setResizing] = useState(false);
  const [height, setHeight] = useState<number>(300);
  const [startY, setStartY] = useState<number>(0);
  const [initialData2, setInitialData2] = useState<Array<MyType>>([
    {
      id: 1,
      name: 'Item 1',
      source: 'Source A',
      dateModified: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'Item 2',
      source: 'Source B',
      dateModified: new Date('2023-01-02'),
    },
    {
      id: 3,
      name: 'Item 4',
      source: 'Source A',
      dateModified: new Date('2023-01-03'),
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);
  const [searchQuery2, setSearchQuery2] = useState('');
  const [filteredData2, setFilteredData2] = useState(initialData2);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [closeSearsh, setCloseSearsh] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    undefined,
  );
  const [sortedData, setSorteData] = useState([...initialData2]);

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
        }
      }
    }
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    q: number,
  ) => {
    if (q == 1) {
      const query = event.target.value.toLowerCase();
      setSearchQuery(query);
      const filtered = initialData.filter((item) =>
        item.name.toLowerCase().includes(query),
      );
      setFilteredData(filtered);
    } else {
      const query2 = event.target.value.toLowerCase();
      setSearchQuery2(query2);
      const filtered2 = initialData2.filter((item) =>
        item.name.toLowerCase().includes(query2),
      );
      setFilteredData2(filtered2);
    }
  };

  const addItem = (newItem: {
    id: number;
    name: string;
    source: string;
    dateModified: Date;
  }) => {
    setFilteredData2((prevData) => [...prevData, newItem]);
    setInitialData2((prevData) => [...prevData, newItem]);
  };

  const deleteItem = (itemId: number) => {
    setFilteredData2((prevData) =>
      prevData.filter((item) => item.id !== itemId),
    );
    setInitialData2((prevData) =>
      prevData.filter((item) => item.id !== itemId),
    );
  };

  const renameItem = (
    item: { id: number; name: string; source: string; dateModified: Date },
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newName = e.target.value;
    setFilteredData2((prevData) =>
      prevData.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, name: newName, dateModified: new Date() }
          : prevItem,
      ),
    );
    setInitialData2((prevData) =>
      prevData.map((prevItem) =>
        prevItem.id === item.id
          ? { ...prevItem, name: newName, dateModified: new Date() }
          : prevItem,
      ),
    );
  };

  const duplicateItem = (item: {
    id: number;
    name: string;
    source: string;
    dateModified: Date;
  }) => {
    if (item) {
      const newItem = {
        id: Date.now(),
        name: `Copy of ${item.name}`,
        source: item.source,
        dateModified: new Date(),
      };
      setFilteredData2((prevData) => [...prevData, newItem]);
      setInitialData2((prevData) => [...prevData, newItem]);
    }
  };

  const handleItemClick = (itemId: number) => {
    setSelectedItemId((prevSelectedItemId) =>
      prevSelectedItemId === itemId ? null : itemId,
    );
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isResizing]);

  const sortAndFilterData = (
    sortingCriteria: string,
    sortingOrder: string,
    selectedSource: string | undefined,
  ) => {
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

    let filteredAndSortedData = sortedData;
    console.log(selectedSource);
    if (selectedSource !== undefined && selectedSource !== 'all') {
      filteredAndSortedData = sortedData.filter(
        (item) => item.source === selectedSource,
      );
    }

    setFilteredData2(filteredAndSortedData);
    setInitialData2(filteredAndSortedData);
  };

  return (
    <Sheet
      key={'buttom'}
      open={!check ? open : check}
      onOpenChange={setOpen}
      modal={false}
    >
      <SheetTrigger className="absolute bottom-2 left-16">
        <Maximize2 className="relative h-4 w-4 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent
        side={'bottom'}
        className="left-16  w-4/5 p-0"
        id="myResizableDiv"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-1 w-full cursor-row-resize"
          onMouseDown={handleMouseDown}
        ></div>
        <div className="flex h-full w-full flex-row pb-4 ">
          <div className="flex w-1/3 flex-col border-r-2 border-black">
            <div className="flex h-10 flex-row justify-between border-b-2 border-black px-2 pb-2">
              <div className="flex flex-row items-center gap-x-2">
                <Minimize2
                  className="h-4 w-4 cursor-pointer"
                  onClick={() => setOpen(false)}
                />
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
                          sortAndFilterData('select', 'bla', e);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Data Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          {Array.from(
                            new Set(initialData2.map((item) => item.source)),
                          ).map((source) => (
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
                      onClick={() =>
                        sortAndFilterData('name', 'asc', selectedSource)
                      }
                    >
                      Name : A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        sortAndFilterData('name', 'des', selectedSource)
                      }
                    >
                      Name : Z-A
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        sortAndFilterData('source', 'asc', selectedSource)
                      }
                    >
                      Type : A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        sortAndFilterData('source', 'des', selectedSource)
                      }
                    >
                      Type : Z-A
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        sortAndFilterData('dateModified', 'asc', selectedSource)
                      }
                    >
                      Last Modified : Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        sortAndFilterData('dateModified', 'des', selectedSource)
                      }
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
                      onChange={(e) => handleSearchChange(e, 1)}
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
              {' '}
              <ul>
                {closeSearsh && (
                  <div className="flex items-center justify-between border-b border-gray-300 py-1">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery2}
                      onChange={(e) => handleSearchChange(e, 2)}
                      className="h-6 w-2/3 rounded-md border border-gray-300"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCloseSearsh(false);
                        setFilteredData2(filteredData2);
                        setSelectedSource(selectedSource);
                      }}
                    >
                      close
                    </Button>
                  </div>
                )}
                {filteredData2.map((item) => (
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
          <div className="flex w-full flex-col border-r-2 border-black">
            <div className="flex h-10 flex-row justify-between border-b-2 border-black pb-2">
              <div className="flex flex-row ">
                <div>close</div>
                <div>searsh</div>
                <div>filter</div>
              </div>
            </div>
            <div className=" ">bla</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
