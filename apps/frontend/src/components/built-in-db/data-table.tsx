
import { useState, useEffect,ChangeEvent,MouseEvent,useReducer,useMemo } from 'react'
import { cn } from "@/lib/cn"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  TableMeta,
  RowData,
  createColumnHelper,
  RowPinningState,
  Row,
  
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"


import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTableStore } from '@/hooks/useTableStore';
// types
import { Record } from '@/pages/built-in-db/table/columns'


declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  defData: TData[]
  onSubmit: (table: { id: number, name: string, rows: TData[] }) => void,
  name:string
}

type Option = {
  label: string;
  value: string;
};

const FooterCell = ({ table,className }) => {
  const meta = table.options.meta
  return (
    <div className="footer-buttons">
      <button className={cn("add-button",className)} onClick={meta?.addRow}>
        Add New +
      </button>
    </div>
  )
}

const VarCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta;
  const tableMeta = table.options.meta;
  const [isFirst, setIsFirst] = useState(row.index == 0);
  const [value, setValue] = useState(initialValue);

  // If the initialValue is changed externally, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    tableMeta?.updateData(row.index, column.id, value);
  };

  const onSelectChange = (selectedValue: string) => {
    setValue(selectedValue);
    tableMeta?.updateData(row.index, column.id,selectedValue);
  };
  const setPlaceholder = (value: string) => {
    // i wanna put the placeholder , depending on the type of the column Name
    if (value === "" && column.id === "name") {
      return "Enter a name"
    }
    if (value === "" && column.id === "type") {
      return "Select.."
    }
    if (value === "" && column.id === "default") {
      return "NULL"
    }
    return value
  }

  {

    return columnMeta?.type === 'select' ? (
      <Select
        onValueChange={onSelectChange}
        value={row.index == 0 ? "" : getValue()}
        disabled={isFirst}
      >
        <SelectTrigger  className={isFirst ? "disabled:cursor-default":""} >
          <SelectValue  placeholder={setPlaceholder(getValue())}      />
        </SelectTrigger>
        <SelectContent >
          {columnMeta?.options?.map((option: Option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
        <Input
          disabled={isFirst}
          className={isFirst ? "disabled:cursor-default":""}
        placeholder={setPlaceholder(getValue())}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        type={columnMeta?.type || 'text'}
      />
    );
  }
};

export default VarCell;


const EditCell = ({ row, table }) => {
  const meta = table.options.meta
  const setEditedRows = (e: MouseEvent<HTMLButtonElement>) => {
    meta?.setEditedRows((old: []) => ({
      ...old,
      [row.id]: !old[row.id],
    }))
  }
  const removeRow = () => {
    meta?.removeRow(row.index);
  };

  if (row.index == 0) {
    return "Primary Key"
  }
  return (
    <div className="edit-cell-container">

        <div className="edit-cell-action">
          <button onClick={removeRow} name="remove">
            X
          </button>
        </div>
    </div>
  );
}
  export function DataTable<TData extends Record, TValue>({
    defData,
    onSubmit,
    name
  }: DataTableProps<TData, TValue>) {
    const tableStore = useTableStore();
    const rerender = useReducer(() => ({}), {})[1]
    const columnHelper = createColumnHelper<Record>();
    const columns = useMemo<ColumnDef<Record, string>[]>(
      () => [
        columnHelper.accessor("name", {
          header: "Name",
          cell: VarCell,
          meta: {
            type: "text"
          }
        }),
        columnHelper.accessor("type", {
          header: "Type",
          cell: VarCell,
          meta: {
            type: "select",
            options: [
              { value: "varchar", label: "varchar" },
              { value: "int", label: "int" },
              { value: "bigint", label: "bigint" },
              { value: "float", label: "float" },
              { value: "boolean", label: "boolean" },

            ],
          }
        }),
        columnHelper.accessor("default", {
          header: "Default",
          cell: VarCell,
          meta: {
            type: "text"
          }
        }),
        columnHelper.display({
          header:"",
          id: "edit",
          cell: EditCell
        }),

      ],
      []
    )
    
    const [data, setData] = useState(() => [...defData]);
    const [originalData, setOriginalData] = useState(() => [...defData]);
    const [editedRows, setEditedRows] = useState({});
    let [loading, setLoading] = useState(true);
  
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      meta: {
        editedRows,
        setEditedRows,
        revertData: (rowIndex: number, revert: boolean) => {
          if (revert) {
            setData((old) =>
              old.map((row, index) =>
                index === rowIndex ? originalData[rowIndex] : row
              )
            );
          } else {
            setOriginalData((old) =>
              old.map((row, index) => (index === rowIndex ? data[rowIndex] : row))
            );
          }
        },
        updateData: (rowIndex: number, columnId: string, value: unknown) => {
          setData((old) =>
            old.map((row, index) => {
              if (index === rowIndex) {
                return {
                  ...old[rowIndex],
                  [columnId]: value,
                };
              }
              return row;
            })
          );
        },
        addRow: () => {
          const newRow: Record = {
            name: "",
            type: "",
            default: "",
          };
          const setFunc = (old) => [...old, newRow];
          setData(setFunc);
          setOriginalData(setFunc);
        },
        removeRow: (rowIndex: number) => {
          const setFilterFunc = (old) =>
            old.filter((row, index) => index !== rowIndex);
          setData(setFilterFunc);
          setOriginalData(setFilterFunc);
        },
      },
    });
// Update the table data when the rows change
    useEffect(() => {
      // Update the store after rendering, but only if the table data has changed
      const newTable = { id: String(Date.now()), name, rows: data };
      tableStore.setCurrentTable(newTable);      
    }, [data,name]);

    return (
      <div className="rounded-md border ">
        <Table className='overflow-y-auto'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className='w-1/4' key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-zinc-500">
          <TableRow>
            <TableHead colSpan={table.getCenterLeafColumns().length} align="left">
              <FooterCell className="text-white" table={table} />
            </TableHead>
          </TableRow>
        </TableFooter>
        </Table>
      </div>
    )
  }

