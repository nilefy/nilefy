import * as React from 'react';

import { cn } from '@/lib/cn';
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual';

export const ROW_HEIGHT = 40;

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    containerRef?: React.RefObject<HTMLDivElement>;
    isVirtualized?: boolean;
  }
>(({ className, ...props }, ref) => {
  const { containerRef, isVirtualized, ...rest } = props;
  return (
    <div
      className="scrollbar-thin relative h-full w-full overflow-auto rounded-md "
      ref={containerRef}
    >
      <table
        ref={ref}
        className={cn(
          'caption-bottom text-sm',
          {
            grid: isVirtualized,
          },
          className,
        )}
        {...rest}
      />
    </div>
  );
});
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    isVirtualized?: boolean;
  }
>(({ className, ...props }, ref) => {
  const { isVirtualized, ...rest } = props;
  return (
    <thead
      ref={ref}
      className={cn(
        '[&_tr]:border-b sticky top-0 z-10',
        { grid: isVirtualized },
        className,
      )}
      {...rest}
    />
  );
});

TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    isVirtualized?: boolean;
    rowVirtualizer?: Virtualizer<HTMLDivElement, Element>;
  }
>(({ className, ...props }, ref) => {
  const { isVirtualized, rowVirtualizer, ...rest } = props;
  if (isVirtualized) {
    if (rest.style === undefined) rest.style = {};
    rest.style.height = `${rowVirtualizer!.getTotalSize()}px`;
  }
  return (
    <tbody
      ref={ref}
      className={cn(
        '',
        {
          'grid relative': isVirtualized,
        },
        className,
      )}
      {...rest}
    />
  );
});
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-primary font-medium text-primary-foreground', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    isVirtualized?: boolean;
    virtualRow?: VirtualItem;
  }
>(({ className, ...props }, ref) => {
  const { isVirtualized, virtualRow, ...rest } = props;
  if (isVirtualized) {
    if (rest.style === undefined) rest.style = {};
    rest.style = {
      ...rest.style,
      transform: `translateY(${virtualRow!.start}px)`,
    };
  }
  return (
    <tr
      ref={ref}
      className={cn(
        'flex border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        {
          'flex absolute w-full': isVirtualized,
        },
        className,
      )}
      {...rest}
    />
  );
});
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    isVirtualized?: boolean;
  }
>(({ className, ...props }, ref) => {
  const { isVirtualized, ...rest } = props;
  return (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        { flex: isVirtualized },
        className,
      )}
      {...rest}
    />
  );
});
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    isVirtualized?: boolean;
  }
>(({ className, ...props }, ref) => {
  if (props.style === undefined) props.style = {};
  props.style.height = ROW_HEIGHT;
  return (
    <td
      role="cell"
      ref={ref}
      className={cn(
        'align-middle [&:has([role=checkbox])]:pr-0  overflow-auto scrollbar-none',
        className,
      )}
      {...props}
    />
  );
});
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export const EmptyRows = ({ numRows }: { numRows: number }) => {
  return (
    <TableRow>
      <TableCell></TableCell>
    </TableRow>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
