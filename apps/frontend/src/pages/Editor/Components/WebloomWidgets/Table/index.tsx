import { Widget, WidgetConfig } from '@/lib/Editor/interface';
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
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { Button } from '@/components/ui/button';
import React, { useContext } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { WidgetContext } from '../..';
//Types
type RowData = Record<string, unknown>;

export type WebLoomTableColumn = {
  id: string;
  accessorKey: string;
  header: string;
  name: string;
  type: 'Default' | 'String' | 'Number' | 'Boolean';
};
export type WebloomTableProps = {
  columns: WebLoomTableColumn[];
  data: RowData[];
  isRowSelectionEnabled: boolean;
  isSearchEnabled?: boolean;
  isPaginationEnabled?: boolean;
  pageSize?: number;
};

// Helper function to generate columns from data
const generateColumnsFromData = (data: RowData[]): WebLoomTableColumn[] => {
  if (data.length === 0) {
    return [];
  }
  return Object.keys(data[0]).map((key, index) => {
    return {
      id: (index + 1).toString(),
      accessorKey: key,
      header: key,
      name: key,
      type: 'Default', // TODO: Infer type from data , or we can put it initially as default and then user can change it
    };
  });
};

const WebloomTable = (props: WebloomTableProps) => {
  const {
    data,
    columns,
    isRowSelectionEnabled,
    isSearchEnabled,
    isPaginationEnabled,
  } = props;
  const { onPropChange } = useContext(WidgetContext);
  //  to run only once when the component is mounted
  React.useEffect(() => {
    if (props.columns.length > 0) {
      return;
    }
    // merging predefined cols and cols generated from data
    const cols = generateColumnsFromData(data);
    cols.forEach((propCol) => {
      const exists = columns.find((col) => col.id === propCol.id);
      if (!exists) {
        columns.push(propCol);
      }
    });

    onPropChange({ key: 'columns', value: cols });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pagination options
  const [{ pageIndex }, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: isPaginationEnabled ? props.pageSize ?? 3 : data.length,
  });
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize: isPaginationEnabled ? props.pageSize ?? 3 : data.length,
    }),
    [pageIndex, isPaginationEnabled, props.pageSize, data.length],
  );

  // sorting options
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering options
  const [globalFilter, setGlobalFilter] = React.useState('');
  // selection options
  const [rowSelection, setRowSelection] = React.useState({});

  // mapping the columns to be  compatible with tanstack-table

  const tableCols = columns.map((col) => {
    return {
      id: col.id,
      accessorKey: col.accessorKey,
      header: ({ column }: { column: Column<RowData> }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.accessorKey.toUpperCase()}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    };
  });

  const table = useReactTable({
    data,
    columns: isRowSelectionEnabled
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
      {isSearchEnabled && (
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
      {isPaginationEnabled && (
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
};

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
  columns: [
    {
      id: '1',
      accessorKey: 'id',
      header: 'ID',
      name: 'ID',
      type: 'Number',
    },
    {
      id: '2',
      accessorKey: 'name',
      header: 'Name',
      name: 'Name',
      type: 'String',
    },
    {
      id: '3',
      accessorKey: 'email',
      header: 'Email',
      name: 'Email',
      type: 'String',
    },
    {
      id: '4',
      accessorKey: 'link',
      header: 'Link',
      name: 'Link',
      type: 'String',
    },
  ],
  data: [
    {
      id: 1,
      name: 'John',
      email: 'knknk@knknk.com',
      link: 'sfsdf',
      isActive: 'true',
      isDeleted: 'true',
    },
    { id: 2, name: 'Jane', email: 'jane@jnjn.com', link: 'sfsdf' },
    { id: 3, name: 'Joe', email: 'joe@jojo.com', link: 'sfsdf' },
    { id: 4, name: 'Joanna', email: 'joana@joajoa.com', link: 'sfsdf' },
    { id: 5, name: 'Joanna', email: 'joana@joajoa.com', link: 'sfsdf' },
    { id: 6, name: 'Joanna', email: 'joana@joajoa.com', link: 'sfsdf' },
  ],
  isRowSelectionEnabled: false,
  isSearchEnabled: false,
  isPaginationEnabled: false,
  pageSize: 3,
};

const widgetName = 'WebloomTable';

const inspectorConfig: WidgetInspectorConfig<WebloomTableProps> = [
  {
    sectionName: 'Columns',
    children: [
      {
        id: `${widgetName}-Columns`,
        key: 'columns',
        label: 'Columns',
        type: 'list',
        options: {},
      },
    ],
  },
  {
    sectionName: 'Row Selection',
    children: [
      {
        id: `${widgetName}-RowSelection`,
        key: 'isRowSelectionEnabled',
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
        id: `${widgetName}-Search`,
        key: 'isSearchEnabled',
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
        id: `${widgetName}-Pagination`,
        key: 'isPaginationEnabled',
        label: 'Enable Pagination',
        type: 'checkbox',
        options: {
          label: 'Enable Pagination',
        },
      },
      {
        id: `${widgetName}-PageSize`,
        key: 'pageSize',
        label: 'Page Size',
        type: 'input',
        options: {},
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
