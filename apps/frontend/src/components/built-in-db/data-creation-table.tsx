
import {
  ColumnDef,
  RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useReducer, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";


import { useTableStore } from '@/hooks/useTableStore';

import { FooterCell } from './footer-cell';
// types
import { Record } from '@/pages/built-in-db/create-table/columns';


declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}


type Option = {
  label: string;
  value: string;
};


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  defData: TData[];
  onSubmit: (table: { id: number, name: string, rows: TData[] }) => void;
  name: string;
}

export function DataCreateTable<TData extends Record, TValue>({
  columns,
  defData,
  onSubmit,
  name,
}: DataTableProps<TData, TValue>) {
  const tableStore = useTableStore();
  const rerender = useReducer(() => ({}), {})[1]
  // const columns = useMemo<ColumnDef<Record, string>[]>(
  //   () => [
  //     columnHelper.accessor("name", {
  //       header: "Name",
  //       cell: VarCell,
  //       meta: {
  //         type: "text"
  //       }
  //     }),
  //     columnHelper.accessor("type", {
  //       header: "Type",
  //       cell: VarCell,
  //       meta: {
  //         type: "select",
  //         options: [
  //           { value: "varchar", label: "varchar" },
  //           { value: "int", label: "int" },
  //           { value: "bigint", label: "bigint" },
  //           { value: "float", label: "float" },
  //           { value: "boolean", label: "boolean" },

  //         ],
  //       }
  //     }),
  //     columnHelper.accessor("default", {
  //       header: "Default",
  //       cell: VarCell,
  //       meta: {
  //         type: "text"
  //       }
  //     }),
  //     columnHelper.display({
  //       header:"",
  //       id: "edit",
  //       cell: EditCell
  //     }),

  //   ],
  //   []
  // )

  const [data, setData] = useState(() => [...defData]);
  const [originalData, setOriginalData] = useState(() => [...defData]);
  const [editedRows, setEditedRows] = useState({});

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
    console.log(columns);
    
  }, [data, name]);

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

