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
import { Key, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
// for parametes in url
import { Outlet, useSearchParams } from 'react-router-dom';
import { fetchTables, addTable, removeTable, renameTable } from './tables';
// ts query
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
// types
interface Column {
  id: number;
  name: string;
  type: string;
  default: string | number | null;
}
export interface Table {
  id: number;
  name: string;
  columns: Column[];
}

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
      default: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => val ?? ''),
    }),
  ),
});

export default function DatabaseTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ search: e.target.value });
  };

  useEffect(() => {
    // Update the search parameter in the URL whenever searchParams.search changes
    setSearchParams({ search: searchParams.get('search') || '' });
  }, [searchParams, setSearchParams]);
  const searchParam = searchParams.get('search') || undefined;
  // fetching / mutating  data / hooks
  const queryClient = useQueryClient();
  const { data: tables, isLoading } = useQuery({
    queryFn: () => fetchTables(searchParam),
    queryKey: ['tables', searchParam],
  });

  const { mutateAsync: addTableMutation } = useMutation({
    mutationFn: (newTable: Table) => addTable(newTable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const { mutate: removeTableMutation } = useMutation({
    mutationFn: (tableId: number) => removeTable(tableId),
    onMutate: async (tableId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      console.log('mutating');

      await queryClient.cancelQueries({ queryKey: ['tables'] });
      const previousTables = queryClient.getQueryData(['tables']);
      // Optimistically update to the new value
      await queryClient.setQueryData(
        ['tables'],
        tables?.filter((table) => table.id !== tableId),
      );
      return { previousTables };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, tableId, context) => {
      console.log(`rolling back`);
      queryClient.setQueryData(['tables'], context?.previousTables);
    },
    // Always refetch after error or success:
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const { mutateAsync: renameTableMutation } = useMutation({
    mutationFn: ({ tableId, newName }: { tableId: number; newName: string }) =>
      renameTable(tableId, newName),
    onMutate: async (variables: { tableId: number; newName: string }) => {
      const { tableId, newName } = variables;
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tables'] });
      const previousTables = queryClient.getQueryData(['tables']);
      // Optimistically update to the new value
      await queryClient.setQueryData(
        ['tables'],
        tables?.map((table) =>
          table.id === tableId ? { ...table, name: newName } : table,
        ),
      );
      return { previousTables };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tables'], context?.previousTables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const { tableId } = useParams();
  const [currentTableId, setCurrentTableId] = useState(Number(tableId) || 0);
  // to highlight table when clicked
  useEffect(() => {
    setCurrentTableId(Number(tableId) || 0);
  }, [tableId]);
  // to handle edit state
  const [editTable, setEditTable] = useState<Table>({
    id: 0,
    name: '',
    columns: [],
  });
  // state for controlling table dialog
  const [isCreateTableDialogOpen, setisCreateTableDialogOpen] = useState(false);

  // error handling
  const { toast } = useToast();
  // TODO: show error in a toast
  const displayErrorToast = (message: string) => {
    toast({
      title: 'Error',
      description: message,
    });
  };
  // form config.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columns: [{ id: 0, name: 'id', type: 'serial', default: 'NULL' }],
    },
    shouldUnregister: false, // Do not unregister fields on removal
  });
  useEffect(() => {
    form.reset({
      columns: [
        {
          id: 0,
          name: 'id',
          type: 'serial',
          default: 'NULL',
        },
      ],
    });
  }, [form, form.reset, isCreateTableDialogOpen]);
  const errors = form.formState.errors;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('submitting form', values);

    try {
      const tableWithId: Table = {
        name: values.name,
        columns: values.columns,
        id: (tables?.length || 0) + 1,
      };

      if (tables) {
        await addTableMutation(tableWithId);
        // If the mutation is successful, set the dialog state
        setisCreateTableDialogOpen(false);
      }
    } catch (error) {
      console.log('Caught error:', error);
      displayErrorToast('An error occurred during form submission');
    }
  }

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

  const handleRemoveTable = (tableId: number) => {
    removeTableMutation(tableId);
  };

  const handleTableClick = (table: Table) => {
    // Reset the editTable state
    setEditTable({ id: 0, name: '', columns: [] });
    // // Reset the current table state (if needed)
    // // setCurrentTable(null);
  };

  // const handleDialogClose = () => {
  //   setIsAddRowDialogOpen(false);
  // };
  const handleCancel = () => {
    form.reset(); // Reset the form to its default values
    setisCreateTableDialogOpen(false); // Close the dialog
  };

  return (
    <div className="flex h-full w-full flex-row">
      <div className="h-screen w-1/4 min-w-[30%] bg-primary/10 ">
        <div className="mx-auto w-5/6">
          <div className="flex flex-col items-center">
            <h1 className="mt-4 inline-flex self-start text-lg font-bold">
              Database
            </h1>
            <Button
              className="mt-6 w-full rounded-md  py-3 sm:w-5/6"
              onClick={handleOnClick}
            >
              <span>Create New Table</span>
            </Button>
            <Dialog open={isCreateTableDialogOpen} onOpenChange={handleCancel}>
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
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mb-4">
                      <Label className="mb-2 block text-lg font-bold">
                        Columns
                      </Label>
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
                                    className="mb-2 block text-sm font-bold"
                                  >
                                    Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={index === 0}
                                      className=" w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                                    />
                                  </FormControl>
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
                                    className="mb-2 block text-sm font-bold"
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
                              render={() => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].default`}
                                    className="mb-2 block text-sm font-bold"
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
                                      className="w-full appearance-none rounded border px-3 leading-tight shadow"
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
                          <div className="ml-3 mt-7 flex-1 items-center ">
                            {index > 0 ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <X size={18} />
                              </Button>
                            ) : (
                              <div className="flex h-9 items-center rounded-md px-3">
                                <span className="mr-2 ">
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
                        className="rounded px-2 py-1  focus:outline-none"
                      >
                        Add Column
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="ml-2 rounded px-4 py-2  "
                      >
                        Create
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <h4 className="inline-flex self-start ">All Tables</h4>
            {/* <Button
              variant="outline"
              onClick={() => {
                toast({
                  variant: 'destructive',
                  title: 'Uh oh! Something went wrong.',
                  description: 'There was a problem with your request.',
                });
              }}
            >
              Show Toast
            </Button> */}
            <div className="mt-4 w-full">
              <Input
                type="text"
                className="w-full"
                placeholder="Search Table"
                value={searchParams.get('search') || ''}
                onChange={handleSearchChange}
              />
              <div className="mt-4">
                <ul className="flex flex-col">
                  {isLoading ? (
                    <div>Loading </div>
                  ) : (tables || []).length > 0 ? (
                    (tables || []).map((table) => (
                      <li
                        key={String(table.id)}
                        className={`flex flex-row items-center justify-between  hover:bg-primary/10  ${
                          currentTableId === table.id ? 'bg-primary/20' : ''
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
                            <NavLink
                              to={table.id.toString()}
                              className={`mt-2 w-full cursor-pointer rounded-md border-gray-300 p-2`}
                              onClick={() => handleTableClick(table)}
                            >
                              <span className="text-sm">{table.name}</span>
                            </NavLink>
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
                  ) : (
                    <div>No matching tables found.</div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
