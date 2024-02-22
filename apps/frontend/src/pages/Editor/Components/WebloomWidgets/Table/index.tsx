import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import {
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  MoveLeft,
  MoveRight,
  Table as TableIcon,
} from 'lucide-react';
import {
  SortingState,
  getSortedRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
  getFilteredRowModel,
  Column,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { autorun, toJS } from 'mobx';
type RowData = Record<string, unknown>;

export type WebLoomTableColumn = {
  id: string;
  accessorKey: string;
  header: string;
  name: string;
  type: 'Default' | 'String' | 'Number' | 'Boolean';
};
export type WebloomTableProps = {
  columns?: WebLoomTableColumn[];
  data: RowData[];
  isRowSelectionEnabled: boolean;
  isSearchEnabled?: boolean;
  isPaginationEnabled?: boolean;
  pageSize?: number;
};

// Helper function to generate columns from data
const generateColumnsFromData = (
  data: RowData | undefined,
): WebLoomTableColumn[] => {
  if (!data) return [];
  return Object.keys(data).map((key, index) => {
    return {
      id: (index + 1).toString(),
      accessorKey: key,
      header: key,
      name: key,
      type: 'Default', // TODO: Infer type from data , or we can put it initially as default and then user can change it
    };
  });
};

const WebloomTable = observer(() => {
  const [tableData, setTableData] = useState<RowData[]>([]);
  const { onPropChange, id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomTableProps;

  //  to run only once when the component is mounted
  React.useEffect(
    () =>
      autorun(() => {
        setTableData(toJS(props.data));
        const columns = generateColumnsFromData(props.data[0]);
        onPropChange({
          key: 'columns',
          value: columns,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // pagination options
  const [{ pageIndex }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: props.isPaginationEnabled
      ? props.pageSize ?? 3
      : props.data.length,
  });
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize: props.isPaginationEnabled
        ? props.pageSize ?? 3
        : props.data.length,
    }),
    [pageIndex, props.isPaginationEnabled, props.pageSize, props.data.length],
  );

  // sorting options
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering options
  const [globalFilter, setGlobalFilter] = React.useState('');
  // selection options
  const [rowSelection, setRowSelection] = React.useState({});

  // mapping the columns to be  compatible with tanstack-table

  const tableCols =
    props.columns?.map((col) => {
      return {
        id: col.id,
        accessorKey: col.accessorKey,
        header: ({ column }: { column: Column<RowData> }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {col.accessorKey.toUpperCase()}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      };
    }) || [];

  const table = useReactTable({
    data: tableData,
    columns: props.isRowSelectionEnabled
      ? [
          {
            id: 'select',
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
          ...tableCols,
        ]
      : tableCols,
    state: { pagination, rowSelection, sorting, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      {props.isSearchEnabled && (
        <div className=" ml-auto  w-[40%] p-2">
          <Input
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className=" border p-2 shadow"
            placeholder="Search"
          />
        </div>
      )}
      <div className="h-full w-full rounded-md border shadow-md">
        <Table className="h-full">
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {props.isPaginationEnabled && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="ghost"
            className="rounded border p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <MoveLeft />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <MoveRight />
          </Button>
          <Button
            variant="ghost"
            className="rounded border p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16 rounded border p-1"
            />
          </span>
        </div>
      )}
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Table',
  icon: <TableIcon />,
  isCanvas: false,
  resizingDirection: 'Both',
  layoutConfig: {
    colsCount: 20,
    rowsCount: 40,
    minColumns: 20,
    minRows: 40,
  },
};

const defaultProps: WebloomTableProps = {
  data: 'dsds',
  columns: [],
  isRowSelectionEnabled: false,
  isSearchEnabled: false,
  isPaginationEnabled: false,
  pageSize: 3,
};

const inspectorConfig: EntityInspectorConfig<WebloomTableProps> = [
  {
    sectionName: 'Columns',
    children: [
      {
        path: 'columns',
        label: 'Columns',
        type: 'list',
      },
    ],
  },
  {
    sectionName: 'Row Selection',
    children: [
      {
        path: 'isRowSelectionEnabled',
        label: 'Allow Selection',
        type: 'checkbox',
        // defaultValue: ,
        // value: isRowSelectionEnabled,
        options: {
          label: 'Allow Selection',
        },
      },
    ],
  },
  {
    sectionName: 'Search',
    children: [
      {
        path: 'isSearchEnabled',
        label: 'Enable Search',
        type: 'checkbox',
        options: {
          label: 'Enable Search',
        },
      },
    ],
  },
  {
    sectionName: 'Pagination',
    children: [
      {
        path: 'isPaginationEnabled',
        label: 'Enable Pagination',
        type: 'checkbox',
        options: {
          label: 'Enable Pagination',
        },
      },
      {
        path: 'pageSize',
        label: 'Page Size',
        type: 'input',
        options: {},
      },
    ],
  },
  {
    sectionName: 'Data',
    children: [
      {
        path: 'data',
        label: 'Data',
        type: 'inlineCodeInput',
        options: {
          label: 'Data',
        },
        validation: zodToJsonSchema(
          z
            .array(z.record(z.string(), z.any()))
            .default([{ id: '1', name: 'John', age: 23 }]),
        ),
      },
    ],
  },
];

const WebloomTableWidget: Widget<WebloomTableProps> = {
  component: WebloomTable,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomTableWidget };
