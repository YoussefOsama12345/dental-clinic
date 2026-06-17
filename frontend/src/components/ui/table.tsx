/**
 * Table — accessible semantic HTML table with consistent project styling.
 *
 * Uses native <table> elements (not CSS grid) so screen readers, keyboard
 * navigation, and browser accessibility features all work correctly.
 *
 * Usage:
 *   <Table>
 *     <TableHeader>
 *       <TableRow>
 *         <TableHead>Name</TableHead>
 *         <TableHead>Status</TableHead>
 *       </TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow>
 *         <TableCell>John</TableCell>
 *         <TableCell>Active</TableCell>
 *       </TableRow>
 *     </TableBody>
 *   </Table>
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

// ── Table ──────────────────────────────────────────────────────────────────
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

// ── TableHeader ────────────────────────────────────────────────────────────
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('border-b border-[#f1f5f9]', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

// ── TableBody ──────────────────────────────────────────────────────────────
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

// ── TableFooter ────────────────────────────────────────────────────────────
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-[#f1f5f9] bg-[#fafafa] font-medium', className)}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

// ── TableRow ───────────────────────────────────────────────────────────────
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-[#f1f5f9] transition-colors hover:bg-[#fafaf9] data-[state=selected]:bg-[#04CF9E]/10',
        className
      )}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

// ── TableHead ──────────────────────────────────────────────────────────────
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8] [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

// ── TableCell ──────────────────────────────────────────────────────────────
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3.5 align-middle text-sm [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

// ── TableCaption ───────────────────────────────────────────────────────────
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-[#94a3b8]', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
