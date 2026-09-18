import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { bySortKey } from "@/lib/sort";
import type { RomDetail } from "@/lib/types";

export default function RomsTable({ roms }: { roms: RomDetail[] }) {
  const columns = useMemo<ColumnDef<RomDetail>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [
            row.name,
            ...row.devices.flatMap((device) => [device.name, device.codename]),
          ]
            .filter(Boolean)
            .join(" "),
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
        accessorKey: "deviceCount",
        meta: { title: "Devices" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Devices" />
        ),
        cell: ({ row }) => {
          const count = row.original.deviceCount;
          return (
            <Link
              to={`/roms/${row.original.id}`}
              prefetch="intent"
              className="w-fit max-w-full text-muted-foreground hover:text-foreground hover:underline"
            >
              {count}
            </Link>
          );
        },
      },
      {
        id: "deviceList",
        accessorFn: (row) =>
          row.devices
            .map((device) => device.name ?? device.codename)
            .join(", "),
        meta: { title: "Device list" },
        enableSorting: false,
        enableColumnFilter: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device list" />
        ),
        cell: ({ row }) => {
          // A bounded preview of the most cross-compatible devices; the full
          // list lives on the ROM page.
          const PreviewLimit = 12;
          const sorted = [...row.original.devices].sort(
            (a, b) =>
              b.romCount - a.romCount ||
              (a.name ?? a.codename).localeCompare(b.name ?? b.codename),
          );
          const names = sorted
            .map((device) => device.name ?? device.codename)
            .join(", ");
          const preview = sorted
            .slice(0, PreviewLimit)
            .map((device) => device.name ?? device.codename)
            .join(", ");
          const hidden = sorted.length - PreviewLimit;
          return (
            <HoverCard>
              <HoverCardTrigger
                render={
                  <span className="block truncate text-left text-muted-foreground" />
                }
              >
                {names}
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="leading-relaxed">{preview}</p>
                <Link
                  to={`/roms/${row.original.id}`}
                  prefetch="intent"
                  className="mt-2 inline-block text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {hidden > 0
                    ? `+${hidden} more · view all ${row.original.deviceCount} devices`
                    : `View all ${row.original.deviceCount} devices`}
                </Link>
              </HoverCardContent>
            </HoverCard>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={roms}
      tableClassName="min-w-[40rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "deviceCount", desc: true }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="roms-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter ROMs or devices…"
            ariaLabel="Filter ROMs or devices"
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
