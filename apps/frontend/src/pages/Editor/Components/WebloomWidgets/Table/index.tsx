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
  getFilteredRowModel,
  Column,
  RowSelectionState,
  FilterFn,
  Table,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  Table as TableInner,
  TableBody as TableBodyInner,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ROW_HEIGHT,
} from './table';
import { Button } from '@/components/ui/button';
import { forwardRef, memo, useContext, useMemo, useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { toJS } from 'mobx';
export type NilefyRowData = Record<string, unknown>;

import { runInAction } from 'mobx';
import { DebouncedInput } from '@/components/debouncedInput';
import { useAutoRun } from '@/lib/Editor/hooks';
import clsx from 'clsx';
import { generateColumnsFromData } from './utils';
//Types
declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}
export const columnTypes = ['Default', 'String', 'Number', 'Boolean'] as const;

export const nilefyTableColumnSchema = z.object({
  id: z.string(),
  accessorKey: z.string(),
  header: z.string(),
  name: z.string(),
  type: z.enum(columnTypes),
});

export type NilefyTableColumn = z.infer<typeof nilefyTableColumnSchema>;

const nilefyTablePropsSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
  columns: z.array(nilefyTableColumnSchema).optional(),
  isRowSelectionEnabled: z.boolean(),
  isSearchEnabled: z.boolean(),
  paginationType: z.enum(['client', 'server', 'virtual']).default('client'),
  pageSize: z.number().optional(),
  pageIndex: z.number().optional(),
  emptyState: z.string().default('No rows found'),
  showHeaders: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  /**
   * Contains the data of the row selected by the user. It's an empty object if no row is selected
   */
  selectedRow: z.record(z.unknown()),
  /**
   *Contains the index of the row selected by the user
   * if no selection will be -1
   */
  selectedRowIndex: z.number().default(-1),
  onRowSelectionChange: z.string().optional(),
  onPageChange: z.string().optional(),
  onSortChange: z.string().optional(),
});

export type NilefyTableProps = z.infer<typeof nilefyTablePropsSchema>;

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

const TableBody = forwardRef<
  HTMLTableSectionElement,
  {
    table: Table<NilefyRowData>;
    emptyState: string;
    emptyRowsCount: number;
  }
>(({ table, emptyState, emptyRowsCount }, ref) => {
  return (
    <TableBodyInner className="bg-white" ref={ref}>
      {table.getRowModel().rows.length === 0 ? (
        <tr className="flex h-full w-full items-center justify-center text-xl">
          <td>{emptyState}</td>
        </tr>
      ) : (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="divide-x last:border hover:bg-gray-300"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="flex items-center justify-start px-4"
                style={{
                  width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}
      {emptyRowsCount > 0 &&
        new Array(emptyRowsCount).fill(0).map((_, index) => (
          <TableRow key={index} className="divide-x hover:bg-gray-300">
            {table.getFlatHeaders().map((header) => (
              <TableCell
                key={header.id}
                className="flex items-center justify-start px-4"
                style={{
                  width: `calc(var(--col-${header.id}-size) * 1px)`,
                }}
              ></TableCell>
            ))}
          </TableRow>
        ))}
    </TableBodyInner>
  );
});

TableBody.displayName = 'TableBody';

export const MemoizedTableBody = memo(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof TableBody;

const usePaginationMeta = ({
  paginationType,
  tableHeight,
  tableTop,
  bodyTop,
  rowsCount,
  serverSidePageSize,
  pageNumber,
}: {
  paginationType: NilefyTableProps['paginationType'];
  tableHeight: number;
  tableTop: number | undefined;
  bodyTop: number | undefined;
  rowsCount: number;
  serverSidePageSize: number;
  pageNumber: number;
}) => {
  const isPaginationEnabled =
    paginationType === 'client' || paginationType === 'server';
  if (!isPaginationEnabled)
    // virtual
    return {
      isPaginationEnabled,
      pageSize: rowsCount,
      emptyRowsCount: 0,
    };
  if (paginationType === 'server') {
    return {
      isPaginationEnabled,
      pageSize: serverSidePageSize,
      emptyRowsCount: 0,
    };
  }
  const bodyHeight = tableHeight - 10 - ((bodyTop ?? 0) - (tableTop ?? 0));
  const pageSize = Math.floor(bodyHeight / ROW_HEIGHT);
  const spentRows = pageNumber * pageSize;
  const emptyRowsCount = rowsCount - spentRows;
  return {
    isPaginationEnabled,
    pageSize,
    emptyRowsCount,
  };
};
const WebloomTable = observer(() => {
  const [tableData, setTableData] = useState<NilefyRowData[]>([]);
  const { onPropChange, id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyTableProps;
  const { columns = [] } = props;
  // sorting options
  const [sorting, setSorting] = useState<SortingState>([]);
  // filtering options
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  //  to run only once when the component is mounted
  useAutoRun(() => {
    const data = toJS(props.data) || [];
    setTableData(toJS(data));
    // merging predefined cols and cols generated from data
    const cols = generateColumnsFromData(data);
    runInAction(() => {
      cols.forEach((propCol) => {
        const exists = columns.find((col) => col.id === propCol.id);
        if (!exists) {
          columns.push(propCol);
        }
      });
      onPropChange({ key: 'columns', value: cols });
    });
  });
  // if the props index is -1 then set the selected row to empty object
  useAutoRun(() => {
    if (props.selectedRowIndex === -1) {
      setRowSelection({});
      onPropChange({ key: 'selectedRow', value: {} });
      onPropChange({ key: 'selectedRowIndex', value: -1 });
    }
  });

  // mapping the columns to be  compatible with tanstack-table

  const tableCols = columns.map((col) => {
    return {
      id: col.id,
      accessorKey: col.accessorKey,
      header: ({ column }: { column: Column<NilefyRowData> }) => {
        return (
          <div
            className="flex h-full w-full cursor-pointer items-center justify-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.accessorKey.toUpperCase()}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
    };
  });
  const tableHeight = widget.pixelDimensions.height;
  const tableTop = widget.dom?.getBoundingClientRect().top;
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const bodyTop = bodyRef.current?.getBoundingClientRect().top;
  const paginationMeta = usePaginationMeta({
    paginationType: props.paginationType,
    tableHeight,
    tableTop,
    bodyTop,
    rowsCount: tableData.length,
    serverSidePageSize: 0,
    pageNumber: props.pageIndex ?? 0,
  });
  const table = useReactTable({
    data: tableData,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    enableMultiRowSelection: false,
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    columnResizeMode: 'onChange',

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
        pageSize: paginationMeta.isPaginationEnabled
          ? paginationMeta.pageSize
          : props.data.length,
      },

      rowSelection,
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater);
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      // execute user event
      widget.handleEvent('onSortChange');
    },
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
      widget.handleEvent('onPageChange');
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
      widget.handleEvent('onRowSelectionChange');
    },
  });
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, columns]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => ROW_HEIGHT,
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
    getScrollElement: () => containerRef.current,
  });
  widget.setValue('pageSize', paginationMeta.pageSize);
  return (
    <div className="scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10 flex h-full w-full flex-col overflow-auto">
      {props.isSearchEnabled && (
        <div className=" ml-auto  w-[40%] p-2">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => {
              setGlobalFilter(String(value));
              // execute user event
              // editorStore.executeActions<typeof webloomTableEvents>(
              //   id,
              //   'onSearchChange',
              // );
            }}
            className=" border p-2 shadow"
            placeholder="Search"
          />
        </div>
      )}
      <div className="block h-full w-full shadow-md">
        <TableInner
          className="h-full w-full"
          containerRef={containerRef}
          style={{
            ...columnSizeVars,
          }}
        >
          <TableHeader className="bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="divide-x hover:bg-gray-300"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="relative"
                      colSpan={header.colSpan}
                      style={{
                        width: `calc(var(--header-${header?.id}-size) * 1px)`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      <div
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: (e) => {
                            e.stopPropagation();
                            const cb = header.getResizeHandler();
                            cb(e);
                          },
                          onTouchStart: header.getResizeHandler(),
                        }}
                        className={clsx(
                          'absolute right-[-5px] top-0 h-full w-[10px] cursor-col-resize touch-none select-none bg-blue-300 opacity-0',
                          {
                            'opacity-100 z-5': header.column.getIsResizing(),
                          },
                        )}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {table.getState().columnSizingInfo.isResizingColumn ? (
            <MemoizedTableBody
              table={table}
              emptyState={props.emptyState}
              emptyRowsCount={paginationMeta.emptyRowsCount}
              ref={bodyRef}
            />
          ) : (
            <TableBody
              table={table}
              emptyState={props.emptyState}
              emptyRowsCount={paginationMeta.emptyRowsCount}
              ref={bodyRef}
            />
          )}
        </TableInner>
      </div>
      {paginationMeta.isPaginationEnabled && (
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
  icon: TableIcon,
  isCanvas: false,
  resizingDirection: 'Both',
  layoutConfig: {
    colsCount: 20,
    rowsCount: 40,
    minColumns: 1,
    minRows: 40,
  },
  widgetActions: {
    setData: {
      name: 'setData',
      path: 'data',
      type: 'SETTER',
    },
    setPage: {
      name: 'setPage',
      path: 'pageIndex',
      type: 'SETTER',
    },
    setPageSize: {
      name: 'setPageSize',
      path: 'pageSize',
      type: 'SETTER',
    },
    setSelectedRowIndex: {
      name: 'setSelectedRowIndex',
      path: 'selectedRowIndex',
      type: 'SETTER',
    },
  },
};

const initialProps: NilefyTableProps = {
  data: [{ id: '1', name: 'John', age: 23 }],
  selectedRow: {},
  selectedRowIndex: -1,
  columns: [],
  isRowSelectionEnabled: false,
  isSearchEnabled: false,
  paginationType: 'client',
  pageSize: 3,
  emptyState: 'No rows found',
  showHeaders: true,
  showFooter: true,
};

const inspectorConfig: EntityInspectorConfig<NilefyTableProps> = [
  {
    sectionName: 'Data',
    children: [
      {
        path: 'data',
        label: 'Data',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Data',
        },
        validation: zodToJsonSchema(
          z.array(z.record(z.string(), z.any())).default(initialProps.data),
        ),
      },
      {
        path: 'selectedRowIndex',
        hidden: () => true,
        label: '',
        type: 'input',
        options: {},
        validation: zodToJsonSchema(
          z.number().default(initialProps.selectedRowIndex),
        ),
      },
    ],
  },
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
    sectionName: 'Table Options',
    children: [
      {
        path: 'isRowSelectionEnabled',
        label: 'Row Selection',
        type: 'checkbox',
      },
      {
        path: 'isSearchEnabled',
        label: 'Search',
        type: 'checkbox',
      },
      {
        path: 'paginationType',
        label: 'Pagination',
        type: 'select',
        options: {
          items: [
            { label: 'Client', value: 'client' },
            { label: 'Server', value: 'server' },
            { label: 'Virtual', value: 'virtual' },
          ],
        },
        validation: zodToJsonSchema(
          nilefyTablePropsSchema.shape.paginationType,
        ),
      },
      {
        path: 'pageSize',
        label: 'Page Size',
        type: 'input',
        options: {
          type: 'number',
        },
      },
      {
        path: 'pageIndex',
        label: 'Page Index',
        type: 'input',
        options: {
          type: 'number',
        },
        validation: zodToJsonSchema(z.number().default(0)),
      },
    ],
  },
  {
    sectionName: 'Appearance',
    children: [
      {
        path: 'emptyState',
        label: 'Empty State',
        type: 'input',
        options: {
          type: 'text',
        },
      },
      {
        path: 'showHeaders',
        label: 'Show Headers',
        type: 'checkbox',
      },
      {
        path: 'showFooter',
        label: 'Show Footer',
        type: 'checkbox',
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onRowSelectionChange',
        label: 'onRowSelectionChange',
        type: 'inlineCodeInput',
        isEvent: true,
        options: {
          placeholder: 'onRowSelectionChange',
        },
      },
      {
        path: 'onPageChange',
        label: 'onPageChange',
        type: 'inlineCodeInput',
        isEvent: true,
        options: {
          placeholder: 'onPageChange',
        },
      },
      {
        path: 'onSortChange',
        label: 'onSortChange',
        type: 'inlineCodeInput',
        isEvent: true,
        options: {
          placeholder: 'onSortChange',
        },
      },
    ],
  },
];

const WebloomTableWidget: Widget<NilefyTableProps> = {
  component: WebloomTable,
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['selectedRow', 'selectedRowIndex', 'columns']),
  publicAPI: {
    selectedRow: {
      type: 'dynamic',
      description: 'Selected row data',
    },
    selectedRowIndex: {
      type: 'dynamic',
      description: 'Selected row Index data',
    },
    pageIndex: {
      type: 'dynamic',
      description: 'if pagination is enabled will be current page index',
    },
  },
};

export { WebloomTableWidget };
