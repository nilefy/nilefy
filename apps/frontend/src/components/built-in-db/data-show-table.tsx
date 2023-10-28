import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
// import { getColumns } from "@/pages/built-in-db/create-table/columns"
interface RowData {
  id: number;
  name: string;
  age: number;
}

type ShowColumn = {
  name: string;
};
interface ColumnType {
  id: number;
  name: string;
  type: string;
  default: string | number | null;
}
// function createColumns<T extends Column>(columnDefinitions: T[]) {
//   const columnHelper = createColumnHelper<Column>();

//   return columnDefinitions.map((columnDef) => {
//     const {name } = columnDef;
//     console.log("columnDef" + JSON.stringify(columnDef));

//       return columnHelper.accessor("name", {
//         header:name
//     })

//   });
// }
// TODO : fix typing here
function generateColumns(properties: ShowColumn[]): any[] {
  const columnHelper = createColumnHelper();

  console.log(
    'Property Names:',
    properties.map((property) => property.name),
  );

  return properties.map((property) => {
    const { name } = property;
    return columnHelper.accessor(property.name, {
      header: name.toLocaleUpperCase(),
      cell: (props) => props.getValue(), // Dynamically retrieve data based on name
    });
  });
}

const defaultData: RowData[] = [
  { id: 1, name: 'John', age: 20 },
  { id: 2, name: 'Jane', age: 21 },
  { id: 3, name: 'Joe', age: 22 },
  { id: 4, name: 'Joanna', age: 23 },
  { id: 5, name: 'Jill', age: 24 },
];

export function DataShowTable({ defColumns }: { defColumns: ColumnType[] }) {
  const [data, setData] = useState(() => [...defaultData]);

  const columns = generateColumns(defColumns);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-4 w-full rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {/* {JSON.stringify(table.getRowModel().rows)} */}
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
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
      </Table>
    </div>
  );
}
