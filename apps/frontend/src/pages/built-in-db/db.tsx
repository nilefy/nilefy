import { useEffect } from 'react';
import { ButtonWithIcon } from '@/components/built-in-db/ButtonWithIcon';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useForm, useFieldArray, SubmitHandler, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ArrowDownAZ, Filter, Pencil, Plus, Upload, } from "lucide-react";
import { useState } from 'react';
import { DataShowTable } from '@/components/built-in-db/data-show-table';
import {
  Dialog,
  DialogTitle,
  DialogContent
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { X,Key } from 'lucide-react';
import { Select, SelectItem, SelectValue, SelectTrigger, SelectContent } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Column  {
  id: number,
  name: string,
  type: string,
  default: string | number | null,
}
interface Table {
  id:number,
  tableName: string,
  columns: Column[], 
}


// for  show table

interface RowData {
  id: number,
  name: string,
}

const Types = ['varchar', 'int', 'bigint', 'serial', 'boolean'] as const;
const formSchema = z.object({
  tableName: z.string().min(2, {
    message: 'TableName must be at least 2 characters.',
  }),
  columns: z.array(
    z.object({
      id: z.number(),
      name: z.string().min(2, {
        message: 'Column name must be at least 2 characters.',
      }),
      type: z.enum(Types),
      default: z.union([z.string(), z.number(), z.null()]),
    }),
  ),
});



export default function DatabaseTable() {

  const [editTable, setEditTable] = useState<Table>({ id: 0, tableName: '', columns: [] });
  // TODO : Remove this 
  const [clickedTable, setClickedTable] = useState<Table>({ id: 0, tableName: '', columns: [] });
  const [tables, setTables] = useState<Table[]>([]);
  const [isCreateTableDialogOpen, setisCreateTableDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
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
}, [fields, append]);

  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission logic here
    const tableWithId: Table = {
      tableName: values.tableName,
      columns: values.columns,
      id: tables.length + 1,
    };
    setClickedTable(tableWithId);
    console.log(tableWithId);

    setTables([...tables, tableWithId]);
    setisCreateTableDialogOpen(false);
  };

  // handle new row dialog,data , 
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  const handleOnClick = () => {
    setisCreateTableDialogOpen(true);
  };

  const handleRemoveTable = (tableId:number) => {
    const updatedTables = tables.filter((table) => table.id !== tableId);
    setTables(updatedTables);
    setClickedTable({ id: 0, tableName: '', columns: []});
  };

  const handleEdit = (table:Table) => {
    setEditTable({ id: table.id, tableName: table.tableName,columns:[] });
  };

  const handleSaveEdit = () => {
    if (editTable.id !== null && editTable.tableName.trim() !== '') {
      const updatedTables = tables.map((table) =>
        table.id === editTable.id ? { ...table, tableName: editTable.tableName } : table
      );
      setTables(updatedTables);
      setEditTable({ id: 0, tableName: '' ,columns:[]});
    }
  };

  const handleCancelEdit = () => {
       setEditTable({ id: 0, tableName: '', columns: [] });
  };

  const handleTableClick = (table:Table) => {


    // Reset the editTable state
    setEditTable({ id: 0, tableName: '',columns:[] });

    setClickedTable(table);
    

    // // Reset the current table state (if needed)
    // // setCurrentTable(null);
  };
  const handleAddRow = () => {
    // Open the dialog
    setIsAddRowDialogOpen(true);
  }


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
    <div className="flex flex-row w-full h-full">
      <div className="w-1/4 bg-gray-200 h-screen min-w-[30%]">
        <div className="mx-auto w-5/6">
          <div className="flex flex-col items-center">
            <h1 className="mt-4 inline-flex self-start font-bold text-lg">
              Database
            </h1>
            <Button
              className="mt-6 w-full bg-black py-3 rounded-md sm:w-5/6"
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
                    className="w-full max-w-lg mx-auto"
                  >
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="tableName"
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
                      <label className="block text-gray-700 text-lg font-bold mb-2">
                        Columns
                      </label>

                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center mb-4">
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
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                  >
                                    Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={index === 0}
                                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <div className="flex-1 ml-4">
                            <FormField
                              control={form.control}
                              name={
                                `columns[${index}].type` as `columns.${number}.type`
                              }
                              render={({ field }) => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].type`}
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                  >
                                    Type
                                  </FormLabel>
                                  <FormControl>
                                    <Select {...field}>
                                      <SelectTrigger disabled={index === 0}>
                                        <SelectValue
                                          placeholder={
                                            index === 0 ? 'serial' : 'Select..'
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="varchar">
                                          varchar
                                        </SelectItem>
                                        <SelectItem value="int">int</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <div className="flex-1 ml-4">
                            <FormField
                              control={form.control}
                              name={
                                `columns[${index}].default` as `columns.${number}.default`
                              }
                              render={({ field }) => (
                                <div>
                                  <FormLabel
                                    htmlFor={`columns[${index}].default`}
                                    className="block text-gray-700 text-sm font-bold mb-2"
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
                                      className="shadow appearance-none border rounded w-full px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                              <div className="bg-blue-400 h-9 rounded-md px-3 flex items-center">
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
                        className="bg-blue-500 text-white px-2 py-1 rounded focus:outline-none focus:shadow-outline"
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
                        className="bg-blue-500 text-white px-4 py-2 rounded ml-2 "
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
                  {tables.map((table) => (
                    <li
                      key={String(table.id)}
                      className={`flex flex-row items-center justify-between  hover:bg-gray-100  ${
                        clickedTable && clickedTable.id === table.id
                          ? 'bg-blue-100'
                          : ''
                      }`}
                    >
                      {table.id === editTable.id ? (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            className="w-5/6 mr-2"
                            value={editTable.tableName}
                            onChange={(e) =>
                              setEditTable({
                                ...editTable,
                                tableName: e.target.value,
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
                          <div
                            className={`text-black cursor-pointer p-2 mt-2 rounded-md border-gray-300 w-full`}
                            onClick={() => handleTableClick(table)}
                          >
                            <span className="text-sm">{table.tableName}</span>
                          </div>
                          <div className="flex  items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <span className="transform rotate-90 p-2 ">
                                  ...
                                </span>
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
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4 bg-gray-100 h-screen">
        <header className="table-info">
          <h1 className="mt-6 pl-8 text-start ">
            {clickedTable.id != 0
              ? 'Tables > ' + clickedTable.tableName
              : 'Tables'}
          </h1>
        </header>
        {clickedTable.id != 0 && (
          <div className="w-full flex justify-center m-0">
            <div className=" w-11/12 mt-4 flex justify-between">
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
            {clickedTable.id != 0 ? (
              <>
                <DataShowTable defColumns={clickedTable.columns} />
                {/* {JSON.stringify(columns)} {JSON.stringify(clickedTable.rows)} */}
              </>
            ) : (
              <div className="flex justify-center items-center h-full">
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