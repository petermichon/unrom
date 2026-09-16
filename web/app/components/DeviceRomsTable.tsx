import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { bySortKey } from "@/lib/sort";
import type { RomSupport } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["sourceUrl"]);
const COLUMN_WIDTHS: Record<string, string> = {
  search: "w-0",
  name: "w-[75%] whitespace-normal",
  sourceUrl: "w-[25%]",
};
const columnClassName = (id: string) =>
  [MOBILE_HIDDEN.has(id) && "hidden md:table-cell", COLUMN_WIDTHS[id]]
    .filter(Boolean)
    .join(" ") || undefined;

interface Props {
  roms: RomSupport[];
}

export default function DeviceRomsTable({ roms }: Props) {
  const columns = useMemo<ColumnDef<RomSupport>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) => row.name,
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM" />
        ),
        sortingFn: (a, b) => bySortKey(a.original.name, b.original.name),
        cell: ({ row }) => (
          <Link
            to={`/roms/${row.original.id}`}
            prefetch="intent"
            title={row.original.name}
            className="block truncate font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "sourceUrl",
        header: "Source",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.sourceUrl ? (
            <a
              href={row.original.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:text-foreground"
            >
              Source
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={roms}
      columnClassName={columnClassName}
      tableClassName="table-fixed min-w-[36rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "name", desc: false }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="device-roms-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter ROMs…"
            ariaLabel="Filter ROMs"
          />
          {table.getState().columnFilters.length > 0 && (
            <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
              Reset
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      )}
    />
  );
}
