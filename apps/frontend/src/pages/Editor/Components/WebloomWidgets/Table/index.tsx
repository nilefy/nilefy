import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
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
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';

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
import {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { useAutoRun, useSize } from '@/lib/Editor/hooks';
import clsx from 'clsx';
import { generateColumnsFromData } from './utils';
import { clamp } from 'lodash';
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

const Pagination = ({
  onPageChange,
  isNextDisabled,
  isPrevDisabled,
  pageNumber,
  totalPageCount,
}: {
  onPageChange: (pageNumber: number) => void;
  isNextDisabled: boolean;
  isPrevDisabled: boolean;
  pageNumber: number;
  totalPageCount: number;
}) => {
  const handlePrevClick = () => {
    onPageChange(pageNumber - 1);
  };

  const handleNextClick = () => {
    onPageChange(pageNumber + 1);
  };
  const [inputValue, setInputValue] = useState(pageNumber + 1);
  useEffect(() => {
    setInputValue(pageNumber + 1);
  }, [pageNumber]);
  return (
    <div className="flex">
      <Button
        variant="ghost"
        onClick={handlePrevClick}
        disabled={isPrevDisabled}
      >
        <ChevronLeft />
      </Button>
      <Input
        type="number"
        min={1}
        max={totalPageCount}
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        onBlur={(e) => {
          let page = e.target.value ? Number(e.target.value) - 1 : 0;
          page = clamp(page, 0, totalPageCount - 1);
          onPageChange(page);
        }}
        className="w-10 rounded border p-1"
      />
      <Button
        variant="ghost"
        onClick={handleNextClick}
        disabled={isNextDisabled}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};

const TableBody = forwardRef<
  HTMLTableSectionElement,
  {
    table: Table<NilefyRowData>;
    emptyState: string;
    emptyRowsCount: number;
    rowVirtualizer?: Virtualizer<HTMLDivElement, Element>;
    isVirtualized?: boolean;
  }
>(
  (
    { table, emptyState, emptyRowsCount, rowVirtualizer, isVirtualized },
    ref,
  ) => {
    const TableRows = useCallback(() => {
      if (isVirtualized) {
        const { rows } = table.getRowModel();
        return rowVirtualizer!.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <TableRow
              data-index={virtualRow.index}
              ref={(node) => rowVirtualizer!.measureElement(node)}
              key={row.id}
              className="divide-x hover:bg-gray-300"
              isVirtualized
              virtualRow={virtualRow}
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
          );
        });
      }
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} className="divide-x hover:bg-gray-300">
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
      ));
    }, [table, isVirtualized, rowVirtualizer]);
    return (
      <TableBodyInner
        className="bg-white"
        ref={ref}
        isVirtualized={isVirtualized}
        rowVirtualizer={rowVirtualizer}
      >
        {table.getRowModel().rows.length === 0 ? (
          <tr className="flex h-full w-full items-center justify-center text-xl">
            <td>{emptyState}</td>
          </tr>
        ) : (
          <TableRows />
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
  },
);

TableBody.displayName = 'TableBody';

export const MemoizedTableBody = memo(
  TableBody,
  (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof TableBody;

const getPaginationMeta = ({
  paginationType,
  tableTop,
  footerTop,
  rowsCount,
  serverSidePageSize,
}: {
  paginationType: NilefyTableProps['paginationType'];
  tableTop: number | undefined;
  footerTop: number | undefined;
  rowsCount: number;
  serverSidePageSize: number;
}) => {
  const isPaginationEnabled =
    paginationType === 'client' || paginationType === 'server';
  if (!isPaginationEnabled)
    // virtual
    return {
      isPaginationEnabled,
      pageSize: rowsCount,
    };
  if (paginationType === 'server') {
    return {
      isPaginationEnabled,
      pageSize: serverSidePageSize,
    };
  }
  const bodyHeight = (footerTop ?? 0) - (tableTop ?? 0) - 40;
  const pageSize = Math.floor(bodyHeight / ROW_HEIGHT);
  return {
    isPaginationEnabled,
    pageSize,
  };
};

const calculateEmptyRowsCount = ({
  isPaginationEnabled,
  pageSize,
  currentPageIndex,
  rowsCount,
}: {
  isPaginationEnabled: boolean;
  pageSize: number;
  currentPageIndex: number;
  rowsCount: number;
}) => {
  if (!isPaginationEnabled) return 0;
  const totalNumberOfPages = Math.ceil(rowsCount / pageSize);
  if (currentPageIndex !== totalNumberOfPages - 1) {
    return 0;
  }
  return pageSize - (rowsCount % pageSize);
};

const useRestPageIndexOnPageSizeChange = ({
  table,
  paginationMeta,
}: {
  table: Table<NilefyRowData>;
  paginationMeta: {
    pageSize: number;
  };
}) => {
  useEffect(() => {
    table.setPageIndex(0);
  }, [paginationMeta.pageSize, table]);
};

const WebloomTable = observer(function WebloomTable() {
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
  const tableTop = useSize(widget.dom)?.top;
  const footerRef = useRef<HTMLDivElement>(null);
  const footerTop = footerRef.current?.getBoundingClientRect().top;
  const paginationMeta = getPaginationMeta({
    paginationType: props.paginationType,
    tableTop,
    footerTop,
    rowsCount: tableData.length,
    serverSidePageSize: 0,
  });
  const emptyRowsCount = calculateEmptyRowsCount({
    isPaginationEnabled: paginationMeta.isPaginationEnabled,
    pageSize: paginationMeta.pageSize,
    currentPageIndex: props.pageIndex ?? 0,
    rowsCount: tableData.length,
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
    manualPagination: props.paginationType === 'server',
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

  useRestPageIndexOnPageSizeChange({
    table,
    paginationMeta,
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
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
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
    <div className="flex h-full w-full flex-col shadow-sm">
      <div className="scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10 flex h-full w-full flex-col overflow-auto rounded-t-md">
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
            isVirtualized={paginationMeta.isPaginationEnabled}
          >
            <TableHeader
              className="bg-white"
              isVirtualized={paginationMeta.isPaginationEnabled}
            >
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
                emptyRowsCount={emptyRowsCount}
                isVirtualized={props.paginationType === 'virtual'}
                rowVirtualizer={rowVirtualizer}
              />
            ) : (
              <TableBody
                table={table}
                emptyState={props.emptyState}
                emptyRowsCount={emptyRowsCount}
                isVirtualized={props.paginationType === 'virtual'}
                rowVirtualizer={rowVirtualizer}
              />
            )}
          </TableInner>
        </div>
      </div>

      <div
        ref={footerRef}
        className="flex w-full items-center justify-center rounded-b-md bg-white py-2"
      >
        {paginationMeta.isPaginationEnabled && (
          <Pagination
            isNextDisabled={!table.getCanNextPage()}
            isPrevDisabled={!table.getCanPreviousPage()}
            pageNumber={table.getState().pagination.pageIndex}
            totalPageCount={table.getPageCount()}
            onPageChange={(pageNumber) => {
              table.setPageIndex(pageNumber);
            }}
          />
        )}
      </div>
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
        hidden(args) {
          return args.finalValues.paginationType === 'virtual';
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
  metaProps: new Set([
    'selectedRow',
    'selectedRowIndex',
    'columns',
    'pageSize',
    'pageIndex',
  ]),
  publicAPI: {
    selectedRow: {
      type: 'dynamic',
      description: 'Selected row data',
    },
    selectedRowIndex: {
      type: 'static',
      typeSignature: 'number',
      description: 'Selected row Index data',
    },
    pageIndex: {
      type: 'static',
      typeSignature: 'number',
      description: 'if pagination is enabled will be current page index',
    },
    pageSize: {
      type: 'static',
      typeSignature: 'number',
      description: 'if pagination is enabled will be current page size',
    },
    setData: {
      type: 'function',
      args: [
        {
          name: 'data',
          type: 'Record<string, unknown>[]',
        },
      ],
      returns: 'void',
      description: 'Set the data of the table',
    },
    setPage: {
      type: 'function',
      args: [
        {
          name: 'pageIndex',
          type: 'number',
        },
      ],
      returns: 'void',
      description: 'Set the page index of the table',
    },
    setSelectedRowIndex: {
      type: 'function',
      args: [
        {
          name: 'selectedRowIndex',
          type: 'number',
        },
      ],
      returns: 'void',
      description: 'Set the selected row index of the table',
    },
  },
};

export { WebloomTableWidget };
