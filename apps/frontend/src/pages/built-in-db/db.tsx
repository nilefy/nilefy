import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import ErrorToast from './ErrorToast';
import { SelectWorkSpace } from '@/components/selectWorkspace';
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

function CreateTableDialog() {
  // state for controlling table dialog
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: tables } = useQuery({
    queryFn: () => fetchTables(),
    queryKey: ['tables'],
  });
  const { mutateAsync: addTableMutation } = useMutation({
    mutationFn: (newTable: Table) => addTable(newTable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
  // form config.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      columns: [{ id: 0, name: 'id', type: 'serial', default: '' }],
    },
    shouldUnregister: false, // Do not unregister fields on removal
    mode: 'onSubmit',
  });
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const tableWithId: Table = {
        name: values.name,
        columns: values.columns,
        id: (tables?.length || 0) + 1,
      };

      if (tables) {
        console.log('submitting form', values);
        await addTableMutation(tableWithId);
        form.reset();
        // If the mutation is successful, set the dialog state
        setIsCreateTableDialogOpen(false);
      }
    } catch (error) {
      console.log('Caught error:', error);
    }
  }

  const handleCancel = () => {
    form.reset(); // Reset the form to its default values
    setIsCreateTableDialogOpen(false); // Close the dialog
  };

  return (
    <Dialog
      open={isCreateTableDialogOpen}
      onOpenChange={setIsCreateTableDialogOpen}
    >
      <DialogTrigger asChild>
        <Button className="mt-6 w-full py-3 sm:w-5/6">Create New Table</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Create Table Name</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-lg"
          >
            <div className="mb-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter table name"
                        {...field}
                        // value={field.value !== undefined ? field.value : ''}
                        // defaultValue=""
                      />
                    </FormControl>
                    {/* {form.formState.submitCount > 0 && ( */}
                    {/*   <ErrorToast */}
                    {/*     message={form.formState.errors.name?.message} */}
                    {/*   /> */}
                    {/* )} */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block text-lg font-bold">Columns</Label>
              {fields.map((item, index) => (
                <div key={item.id} className="mb-4 flex items-center">
                  <div className="hidden">
                    <Input
                      {...form.register(`columns.${index}.id`)}
                      value={index + 1}
                      hidden
                    />
                  </div>
                  {/** NAME*/}
                  <div className="flex-1">
                    <FormLabel className="mb-2 block text-sm font-bold">
                      Name
                      <Input
                        {...form.register(`columns.${index}.name`)}
                        disabled={index === 0}
                        className=" w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                      />
                    </FormLabel>
                    <ErrorToast
                      message={
                        form.formState.errors.columns?.[index]?.name?.message
                      }
                    />
                  </div>
                  {/**TYPE*/}
                  <div className="ml-4 flex-1">
                    <FormField
                      control={form.control}
                      name={`columns.${index}.type`}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger disabled={index === 0}>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {columnTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/**DEFAULT*/}
                  <div className="ml-4 flex-1">
                    <FormLabel className="mb-2 block text-sm font-bold">
                      Default
                      <Input
                        {...form.register(`columns.${index}.default`)}
                        disabled={index === 0}
                        placeholder="NULL"
                        className="w-full appearance-none rounded border px-3 leading-tight shadow"
                      />
                    </FormLabel>
                    {form.formState.submitCount > 0 && (
                      <ErrorToast
                        message={
                          form.formState.errors.columns?.[index]?.default
                            ?.message
                        }
                      />
                    )}
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

              {/**APPEND*/}
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

            {/*FOOTER*/}
            <div className="flex justify-end">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" className="ml-2 rounded px-4 py-2  ">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
    queryFn: () => fetchTables(),
    queryKey: ['tables'],
  });

  const { mutate: removeTableMutation } = useMutation({
    mutationFn: (tableId: number) => removeTable(tableId),
    onMutate: async (tableId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      console.log('mutating');
      await queryClient.cancelQueries({ queryKey: ['tables'] });
      const previousTables = queryClient.getQueryData(['tables']);
      // Optimistically update to the new value
      queryClient.setQueryData(
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

  // to handle edit state
  const [editTable, setEditTable] = useState<Table>({
    id: 0,
    name: '',
    columns: [],
  });

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

  // const handleTableClick = (table: Table) => {
  //   // Reset the editTable state
  //   setEditTable({ id: 0, name: '', columns: [] });
  //   // // Reset the current table state (if needed)
  //   // // setCurrentTable(null);
  // };

  return (
    <div className="flex h-full w-full flex-row">
      {/**sidebar*/}
      <div className="bg-primary/10 flex h-full w-1/4 min-w-[15%] flex-col gap-9">
        {/**header*/}
        <div className="flex h-fit flex-col items-center gap-5 pl-3">
          <h1 className="self-start text-lg font-bold">Database</h1>
          <CreateTableDialog />
        </div>
        {/*tables list*/}
        <div className="flex max-h-full flex-col items-center gap-5 overflow-y-auto ">
          <h4 className="self-start ">All Tables</h4>
          <Input
            type="search"
            className="w-full self-center"
            placeholder="Search Table"
            value={searchParams.get('search') || ''}
            onChange={handleSearchChange}
          />
          <ul className="flex h-full w-full flex-col overflow-y-auto">
            {isLoading ? (
              <div>Loading </div>
            ) : (tables || []).length > 0 ? (
              (tables || [])
                .filter((table) =>
                  searchParam
                    ? table.name
                        .toLowerCase()
                        .includes(searchParam.toLowerCase())
                    : true,
                )
                .map((table) => (
                  <li
                    key={String(table.id)}
                    className={`flex flex-row items-center  justify-between`}
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
                        <Button onClick={handleSaveEdit} variant="secondary">
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
                          className={({ isActive }) => {
                            return `mt-2 w-full cursor-pointer rounded-md  p-2 ${
                              isActive ? 'bg-primary/10' : ''
                            }`;
                          }}
                        >
                          {table.name}
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
                                  onClick={() => handleRemoveTable(table.id)}
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

        <div className="mt-auto w-full">
          <SelectWorkSpace />
        </div>
      </div>

      <Outlet />
    </div>
  );
}
