import { cn } from '@platform/utils';
import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
          striped &&
            '[&_tbody_tr:nth-child(even)]:bg-gray-50 dark:[&_tbody_tr:nth-child(even)]:bg-gray-800/50',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHead = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-gray-200 dark:border-gray-700', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement> &
    ThHTMLAttributes<HTMLTableCellElement> & { as?: 'td' | 'th' }
>(({ className, as: Component = 'td', ...props }, ref) => (
  <Component
    ref={ref as never}
    className={cn(
      'px-4 py-3 text-left align-middle',
      Component === 'th' && 'font-medium text-gray-500 dark:text-gray-400',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
