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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bySortKey, referenceLabel } from "@/lib/sort";
import type { RomSupport } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["referenceUrl"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

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
        meta: { title: "ROM" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM" />
        ),
        sortingFn: (a, b) => bySortKey(a.original.name, b.original.name),
        cell: ({ row }) => (
          <Link
            to={`/roms/${row.original.id}`}
            prefetch="intent"
            title={row.original.name}
            className="w-fit max-w-full truncate font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "referenceUrl",
        meta: { title: "Reference" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Reference" />
        ),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.referenceUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={row.original.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open reference: ${row.original.referenceUrl}`}
                    className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  />
                }
              >
                <span className="truncate">
                  {referenceLabel(row.original.referenceUrl)}
                </span>
                <ExternalLink className="size-3 shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-all">
                {row.original.referenceUrl}
              </TooltipContent>
            </Tooltip>
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
      tableClassName="min-w-[36rem]"
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
