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
  getFilteredRowModel,
  Column,
  RowSelectionState,
  FilterFn,
  SortingFn,
  sortingFns,
} from '@tanstack/react-table';
import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import {
  genEventHandlerUiSchema,
  widgetsEventHandler,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';
import { runInAction } from 'mobx';
import { DebouncedInput } from '@/components/debouncedInput';

//Types
declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}
type RowData = Record<string, unknown>;
export const columnTypes = ['Default', 'String', 'Number', 'Boolean'] as const;

export const webLoomTableColumn = z.object({
  id: z.string(),
  accessorKey: z.string(),
  header: z.string(),
  name: z.string(),
  type: z.enum(columnTypes),
});

export type WebLoomTableColumn = z.infer<typeof webLoomTableColumn>;

const webloomTableEvents = {
  onRowSelectionChange: 'onRowSelectionChage',
  onPageChange: 'onPageChange',
  onSearchChange: 'onSearchChange',
  onSortChange: 'onSortChange',
} as const;

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId].itemRank!,
      rowB.columnFiltersMeta[columnId].itemRank!,
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

const webloomTableProps = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
  columns: z.array(webLoomTableColumn).optional(),
  isRowSelectionEnabled: z.boolean(),
  isSearchEnabled: z.boolean(),
  isPaginationEnabled: z.boolean(),
  pageSize: z.number().optional(),
  pageIndex: z.number().optional(),
  appearance: z.object({
    emptyState: z.string().default('No rows found'),
    showHeaders: z.boolean().default(true),
    showFooter: z.boolean().default(true),
  }),
  events: widgetsEventHandler,
  /**
   * Contains the data of the row selected by the user. It's an empty object if no row is selected
   */
  selectedRow: z.record(z.unknown()),
  /**
   *Contains the index of the row selected by the user
   * if no selection will be -1
   */
  selectedRowIndex: z.number(),
});

export type WebloomTableProps = z.infer<typeof webloomTableProps>;

/**
 * Helper function to generate columns from data
 */
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

const WebloomTable = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomTableProps;
  const { data = [], columns = [] } = props;

  //  to run only once when the component is mounted
  React.useEffect(() => {
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
  }, [onPropChange, data]);

  // sorting options
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering options
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableMultiRowSelection: false,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    state: {
      pagination: {
        pageIndex: props.pageIndex ?? 0,
        pageSize: props.isPaginationEnabled
          ? props.pageSize ?? 3
          : props.data.length,
      },
      rowSelection,
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater);
    },
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater);
      // execute user event
      editorStore.executeActions<typeof webloomTableEvents>(id, 'onSortChange');
    },
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const v =
        typeof updater === 'function'
          ? updater({
              pageIndex: props.pageIndex ?? 0,
              pageSize: props.pageSize ?? props.data.length,
            })
          : updater;
      runInAction(() => {
        onPropChange({
          key: 'pageIndex',
          value: v.pageIndex,
        });
        onPropChange({
          key: 'pageSize',
          value: v.pageSize,
        });
      });
      // execute user event
      editorStore.executeActions<typeof webloomTableEvents>(id, 'onPageChange');
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: (updater) => {
      const selectedIndex: string | undefined = Object.keys(
        typeof updater === 'function' ? updater(rowSelection) : updater,
      )[0];
      onPropChange({
        key: 'selectedRow',
        value: selectedIndex ? props.data[+selectedIndex] : {},
      });
      onPropChange({
        key: 'selectedRowIndex',
        value: selectedIndex ? +selectedIndex : -1,
      });
      setRowSelection(updater);
      // execute user event
      editorStore.executeActions<typeof webloomTableEvents>(
        id,
        'onRowSelectionChange',
      );
    },
  });

  return (
    <div className="flex h-full w-full flex-col overflow-auto scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10">
      {props.isSearchEnabled && (
        <div className=" ml-auto  w-[40%] p-2">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => {
              setGlobalFilter(String(value));
              // execute user event
              editorStore.executeActions<typeof webloomTableEvents>(
                id,
                'onSearchChange',
              );
            }}
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
            {table.getRowModel().rows.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-xl">
                {props.appearance.emptyState}
              </div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
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
  data: [],
  selectedRow: {},
  selectedRowIndex: -1,
  columns: [],
  events: [],
  isRowSelectionEnabled: false,
  isSearchEnabled: false,
  isPaginationEnabled: false,
  pageSize: 3,
  appearance: {
    emptyState: 'No rows found',
    showHeaders: true,
    showFooter: true,
  },
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      data: zodToJsonSchema(webloomTableProps.shape.data),
      columns: zodToJsonSchema(z.array(webLoomTableColumn)),
      isRowSelectionEnabled: {
        type: 'boolean',
        default: defaultProps.isRowSelectionEnabled,
      },
      isSearchEnabled: {
        type: 'boolean',
        default: defaultProps.isSearchEnabled,
      },
      isPaginationEnabled: {
        type: 'boolean',
        default: defaultProps.isPaginationEnabled,
      },
      appearance: zodToJsonSchema(webloomTableProps.shape.appearance),
      pageSize: { type: 'number' },
      events: widgetsEventHandlerJsonSchema,
      selectedRow: zodToJsonSchema(webloomTableProps.shape.selectedRow),
      selectedRowIndex: {
        type: 'number',
        default: -1,
      },
      pageIndex: {
        type: 'number',
      },
    },
    required: [
      'data',
      'events',
      'appearance',
      'isRowSelectionEnabled',
      'isSearchEnabled',
      'isPaginationEnabled',
      'rowSelection',
    ],
  },
  uiSchema: {
    selectedRow: { 'ui:widget': 'hidden' },
    selectedRowIndex: { 'ui:widget': 'hidden' },
    pageIndex: { 'ui:widget': 'hidden' },
    columns: {
      'ui:widget': 'sortableList',
    },
    data: {
      'ui:widget': 'inlineCodeInput',
    },
    events: genEventHandlerUiSchema(webloomTableEvents),
  },
};

const WebloomTableWidget: Widget<WebloomTableProps> = {
  component: WebloomTable,
  config,
  defaultProps,
  schema,
  setters: {
    setData: {
      path: 'data',
      type: 'array<object>',
    },
    setPage: {
      path: 'pageIndex',
      type: 'number',
    },
    setPageSize: { path: 'pageSize', type: 'number' },
  },
};

export { WebloomTableWidget };
