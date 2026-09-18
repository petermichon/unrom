import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props<TData> {
  table: Table<TData>;
}

function label(id: string) {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

// Prefer the column's own header title (registered via `DataTableColumnHeader`)
// so the View menu can never drift from the table headers.
function columnLabel(column: {
  id: string;
  columnDef: { meta?: unknown };
}): string {
  const meta = column.columnDef.meta as { title?: unknown } | undefined;
  return typeof meta?.title === "string" ? meta.title : label(column.id);
}

export function DataTableViewOptions<TData>({ table }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          />
        }
      >
        <SlidersHorizontal className="size-4" />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
