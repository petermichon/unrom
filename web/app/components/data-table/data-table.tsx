import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: (table: TanStackTable<TData>) => ReactNode;
  columnClassName?: (columnId: string) => string | undefined;
  tableClassName?: string;
  initialState?: {
    columnVisibility?: VisibilityState;
    columnFilters?: ColumnFiltersState;
    sorting?: SortingState;
    pagination?: PaginationState;
  };
  // Optional controlled state (used to sync filters/visibility with the URL).
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
}

// Equal-share columns: a fixed layout with `width: 1%` on every column makes
// the browser scale all columns to the same width, independent of content.
const EQUAL_SHARE = "w-[1%]";

// Controlled-or-internal state. The latest value is tracked in a ref so several
// changes in one tick compose even before a controlled prop re-renders.
function useControllableState<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = useState(initial);
  const value = controlled ?? internal;
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);

  const set = (updater: T | ((prev: T) => T)) => {
    const next =
      typeof updater === "function"
        ? (updater as (prev: T) => T)(ref.current)
        : updater;
    ref.current = next;
    if (controlled !== undefined) onChange?.(next);
    else setInternal(next);
  };

  return [value, set];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  columnClassName,
  tableClassName,
  initialState,
  columnFilters: controlledFilters,
  onColumnFiltersChange,
  columnVisibility: controlledVisibility,
  onColumnVisibilityChange,
  sorting: controlledSorting,
  onSortingChange,
  pagination: controlledPagination,
  onPaginationChange,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useControllableState(
    controlledSorting,
    initialState?.sorting ?? [],
    onSortingChange,
  );
  const [columnFilters, setColumnFilters] = useControllableState(
    controlledFilters,
    initialState?.columnFilters ?? [],
    onColumnFiltersChange,
  );
  const [columnVisibility, setColumnVisibility] = useControllableState(
    controlledVisibility,
    initialState?.columnVisibility ?? {},
    onColumnVisibilityChange,
  );
  const [pagination, setPagination] = useControllableState(
    controlledPagination,
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
    onPaginationChange,
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Page index is owner-managed (and URL-synced) when controlled.
    autoResetPageIndex: controlledPagination === undefined,
  });

  const cellClass = (columnId: string) =>
    cn(
      columnId === "search" ? "w-0" : EQUAL_SHARE,
      columnClassName?.(columnId),
    ) || undefined;

  return (
    <div className="flex flex-col gap-4">
      {toolbar?.(table)}

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table className={cn("table-fixed", tableClassName)}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cellClass(header.column.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("py-3", cellClass(cell.column.id))}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SearchX />
                      </EmptyMedia>
                      <EmptyTitle>No results</EmptyTitle>
                      <EmptyDescription>
                        Try adjusting your search or filters.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
