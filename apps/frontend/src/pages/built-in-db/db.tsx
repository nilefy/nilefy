import { ButtonWithIcon } from '@/components/built-in-db/ButtonWithIcon';
import { DataShowTable } from '@/components/built-in-db/data-show-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDownAZ,
  Filter,
  Key,
  Pencil,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
// for parametes in url
import { useSearchParams } from 'react-router-dom';
import { fetchTables, addTable, removeTable, renameTable } from './tables';

// ts query
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Column {
  id: number;
  name: string;
  type: string;
  default: string | number | null;
}
interface Table {
  id: number;
  name: string;
  columns: Column[];
}

// for  show table

// initial validation
const columnTypes = ['varchar', 'int', 'bigint', 'serial', 'boolean'] as const;
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'TableName must be at least 2 characters.',
  }),
  columns: z.array(
    z.object({
      id: z.number(),
      name: z.string().min(2, {
        message: 'Column name must be at least 2 characters.',
      }),
      type: z.enum(columnTypes),
      default: z.union([z.string(), z.number(), z.null()]),
    }),
  ),
});

export default function DatabaseTable() {
  const queryClient = useQueryClient();
  const { data: tables, isLoading } = useQuery({
    queryFn: () => fetchTables(),
    queryKey: ['tables'],
  });
  const { mutateAsync: addTableMutation } = useMutation({
    mutationFn: (newTable: Table) => addTable(newTable),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
    },
  });

  const { mutateAsync: removeTableMutation } = useMutation({
    mutationFn: (tableId: number) => removeTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
    },
  });

  const { mutateAsync: renameTableMutation } = useMutation({
    mutationFn: ({ tableId, newName }: { tableId: number; newName: string }) =>
      renameTable(tableId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
    },
  });
  // to include tableId in url
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTableId, setCurrentTableId] = useState(
    Number(searchParams.get('id')),
  );

  // to highlight table when clicked
  useEffect(() => {
    setCurrentTableId(Number(searchParams.get('id')));
  }, [searchParams]);
  // to handle edit state
  const [editTable, setEditTable] = useState<Table>({
    id: 0,
    name: '',
    columns: [],
  });
  // TODO : Remove this
  const [isCreateTableDialogOpen, setisCreateTableDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const control = form.control;
  const { fields, prepend, append, remove } = useFieldArray({
    control,
    name: 'columns',
  });
  // Add a default row with ID, serial, NULL
  useEffect(() => {
    if (fields.length === 0) {
      prepend({ id: 0, name: 'id', type: 'serial', default: 'NULL' });
    }
  }, [fields, prepend]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission logic here
    const tableWithId: Table = {
      name: values.name,
      columns: values.columns,
      id: tables.length + 1,
    };
    // console.log(tableWithId);
    setSearchParams({ ...searchParams, id: String(tableWithId.id) });
    if (tables) {
      addTableMutation(tableWithId);
    }
    // setTables([...tables, tableWithId]);
    setisCreateTableDialogOpen(false);
  }

  // TODO: handle new row dialog,data ,
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  const handleOnClick = () => {
    setisCreateTableDialogOpen(true);
  };

const handleSaveEdit = async () => {
  if (editTable.id !== null && editTable.name.trim() !== '') {
    try {
      await renameTableMutation({
        tableId: editTable.id,
        newName: editTable.name,
      });
      // No need to manually update state, React Query will handle the cache update
      setEditTable({ id: 0, name: '', columns: [] });
    } catch (error) {
      // Handle error if necessary
      console.error('Error renaming table:', error);
    }
  }
};

  const handleCancelEdit = () => {
    setEditTable({ id: 0, name: '', columns: [] });
  };

  // Event handlers
  const handleEdit = (table: Table) => {
    setEditTable({ id: table.id, name: table.name, columns: [] });
  };
  const handleRemoveTable = async (tableId: number) => {
    await removeTableMutation(tableId);
  };

  const handleRenameTable = async (tableId: number, newName: string) => {
    await renameTableMutation({ tableId, newName });
  };


  const handleTableClick = (table: Table) => {
    // Reset the editTable state
    setEditTable({ id: 0, name: '', columns: [] });
    setSearchParams({ ...searchParams, id: String(table.id) });

    // // Reset the current table state (if needed)
    // // setCurrentTable(null);
  };

  const handleAddRow = () => {
    // Open the dialog
    setIsAddRowDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    // if (clickedTable) {
    //   // TODO: Add the new row to the table
    //   console.log("handling submit");
    //   // Close the dialog
    //   setIsAddRowDialogOpen(false);
    // }
  };

  const handleDialogClose = () => {
    setIsAddRowDialogOpen(false);
  };
  const onChange = () => {
    // if (!open) {
    //   setIsAddRowDialogOpen(false);
    // }
    setisCreateTableDialogOpen(false);
  };

  return (
    <div className="flex h-full w-full flex-row">
      <div className="h-screen w-1/4 min-w-[30%] bg-gray-200">
        <div className="mx-auto w-5/6">
          <div className="flex flex-col items-center">
            <h1 className="mt-4 inline-flex self-start text-lg font-bold">
              Database
            </h1>
            <Button
              className="mt-6 w-full rounded-md bg-black py-3 sm:w-5/6"
              onClick={handleOnClick}
            >
              <span className="text-white">Create New Table</span>
            </Button>
            <Dialog open={isCreateTableDialogOpen} onOpenChange={onChange}>
              <DialogContent>
                <DialogTitle>Create Table Name</DialogTitle>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mx-auto w-full max-w-lg"
                  >
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter table name"
                                {...field}
                              />
                            </FormControl>
                            {/* <FormDescription>
                              This is a description for the table name.
                            </FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="mb-2 block text-lg font-bold text-gray-700">
                        Columns
                      </label>

                      {fields.map((item, index) => (
                        <div key={item.id} className="mb-4 flex items-center">
                          <div className="hidden">
                            <Input
                              {...form.register(
                                `columns[${index}].id` as `columns.${number}.id`,
                              )}
                              value={index + 1}
                              hidden
                            />
                          </div>
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={
                                `columns[${index}].name` as `columns.${number}.name`
                              }
                              render={({ field }) => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].name`}
                                    className="mb-2 block text-sm font-bold text-gray-700"
                                  >
                                    Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={index === 0}
                                      className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <FormField
                              control={form.control}
                              name={
                                `columns[${index}].type` as `columns.${number}.type`
                              }
                              render={({ field }) => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].type`}
                                    className="mb-2 block text-sm font-bold text-gray-700"
                                  >
                                    Type
                                  </FormLabel>
                                  <FormControl>
                                    <Select {...field}>
                                      <SelectTrigger disabled={index === 0}>
                                        <SelectValue
                                          placeholder="Select.."
                                          defaultValue={
                                            (index === 0
                                              ? 'serial'
                                              : field.value) || ''
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {columnTypes.map((type) => (
                                          <SelectItem
                                            key={type}
                                            value={type}
                                            disabled={
                                              index === 0 && type === 'serial'
                                            }
                                          >
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <FormField
                              control={form.control}
                              name={
                                `columns[${index}].default` as `columns.${number}.default`
                              }
                              render={({ field }) => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].default`}
                                    className="mb-2 block text-sm font-bold text-gray-700"
                                  >
                                    Default
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...form.register(
                                        `columns[${index}].default` as `columns.${number}.default`,
                                      )}
                                      value={item.default ?? ''} // Provide a default value when the value is null
                                      disabled={index === 0}
                                      placeholder="NULL"
                                      className="focus:shadow-outline w-full appearance-none rounded border px-3 leading-tight text-gray-700 shadow"
                                    />
                                  </FormControl>
                                  <div>
                                    {' '}
                                    <FormMessage />
                                  </div>
                                </div>
                              )}
                            />
                          </div>
                          <div className="flex-0.5 ml-3 mt-7 items-center">
                            {index > 0 ? (
                              <ButtonWithIcon
                                variant="destructive"
                                icon={<X size={18} />}
                                size="sm"
                                onClick={() => remove(index)}
                              />
                            ) : (
                              <div className="flex h-9 items-center rounded-md bg-blue-400 px-3">
                                <span className="mr-2 text-white">
                                  <Key size={20} />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() =>
                          append({
                            type: 'varchar', // Provide the default type
                            id: fields.length + 1, // Assuming 'fields' is your array of columns
                            name: '', // Provide the default name
                            default: '', // Provide the default default value
                          })
                        }
                        className="focus:shadow-outline rounded bg-blue-500 px-2 py-1 text-white focus:outline-none"
                      >
                        Add Column
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => onChange}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="ml-2 rounded bg-blue-500 px-4 py-2 text-white "
                      >
                        Submit
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <h4 className="inline-flex self-start text-gray-500 ">
              All Tables
            </h4>
            <div className="mt-4 w-full">
              <Input
                type="text"
                className="w-full"
                placeholder="Search Table"
                // value={searchText}
                // onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="mt-4">
                <ul className="flex flex-col">
                  {isLoading ? (
                    <div>Loading </div>
                  ) : (
                    tables.map((table) => (
                      <li
                        key={String(table.id)}
                        className={`flex flex-row items-center justify-between  hover:bg-gray-100  ${
                          currentTableId === table.id
                            ? 'bg-blue-100' // Highlight based on URL parameter
                            : ''
                        }`}
                      >
                        {table.id === editTable.id ? (
                          <div className="flex items-center">
                            <Input
                              type="text"
                              className="mr-2 w-5/6"
                              value={editTable.name}
                              onChange={(e) =>
                                setEditTable({
                                  ...editTable,
                                  name: e.target.value,
                                })
                              }
                            />
                            <Button
                              onClick={handleSaveEdit}
                              variant="secondary"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="default"
                              className="mx-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`mt-2 w-full cursor-pointer rounded-md border-gray-300 p-2 text-black`}
                              onClick={() => handleTableClick(table)}
                            >
                              <span className="text-sm">{table.name}</span>
                            </div>
                            <div className="flex  items-center justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <span className="rotate-90 p-2">...</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="flex flex-col">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(table)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  {!editTable.id && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRemoveTable(table.id)
                                      }
                                    >
                                      Remove
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen w-3/4 bg-gray-100">
        <header className="table-info">
          <h1 className="mt-6 pl-8 text-start ">
            {currentTableId !== 0
              ? `Tables > ${
                  tables.find((table) => table.id === currentTableId)?.name ||
                  ''
                }`
              : 'Tables'}
          </h1>
        </header>
        {currentTableId != 0 && (
          <div className="m-0 flex w-full justify-center">
            <div className=" mt-4 flex w-11/12 justify-between">
              <div>
                {/* Add new column */}
                <ButtonWithIcon
                  icon={<Plus size={20} />}
                  text={'Add new Column'}
                  size="sm"
                  className="mr-4"
                  onClick={() => handleAddColumn()}
                />
                {/* Add new row */}
                <ButtonWithIcon
                  icon={<Plus size={20} />}
                  text={'Add new Row'}
                  size="sm"
                  className="mr-4"
                  onClick={() => handleAddRow()}
                />

                {/* Edit row */}
                <ButtonWithIcon
                  icon={<Pencil size={20} />}
                  text={'Edit row'}
                  size="sm"
                  className="mr-4"
                  onClick={() => handleEditRow()}
                />

                {/* Bulk upload data */}
                <ButtonWithIcon
                  icon={<Upload size={20} />}
                  text={'Bulk upload data'}
                  size="sm"
                  className="mr-4"
                  onClick={() => handleBulkUpload()}
                />
              </div>

              <div>
                {/* Filter */}
                <ButtonWithIcon
                  icon={<Filter size={20} />}
                  text={'Filter'}
                  size="sm"
                  className="mr-4"
                  onClick={() => handleFilter()}
                />

                {/* Sort */}
                <ButtonWithIcon
                  icon={<ArrowDownAZ size={20} />}
                  text={'Sort'}
                  size="sm"
                  onClick={() => handleFilter()}
                />
              </div>
            </div>
          </div>
        )}
        <div className="w-full">
          <main className="w-full ">
            {currentTableId != 0 ? (
              <>
                <DataShowTable
                  defColumns={
                    tables.find((table) => table.id === currentTableId)?.columns ||
                    []
                  }
                />
                {/* {JSON.stringify(columns)} {JSON.stringify(clickedTable.rows)} */}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                No data
              </div>
            )}
          </main>
        </div>

        {/* // Dialog for adding a new row */}
        <Dialog open={isAddRowDialogOpen} onOpenChange={onChange}>
          <DialogContent>
            <DialogTitle>Enter Row Data</DialogTitle>
            {/* {clickedTable?.columns.map((column) => (
              <div key={column.name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{column.name}</label>
                <Input
                  disabled={column.name === "id"}
                  type="text"
                  value={column.name==="id"?clickedTable.rows.length+1:newRowData[column.name]}
                  onChange={(e) => setNewRowData({ ...newRowData, [column.name]: e.target.value })}
                />
              </div>
            ))} */}
            <div>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleDialogSubmit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
