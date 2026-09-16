import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { ChipLink } from "@/components/ChipLink";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { bySortKey } from "@/lib/sort";
import type { RomDetail } from "@/lib/types";

const COLUMN_WIDTHS: Record<string, string> = {
  search: "w-0",
  name: "w-[25%] whitespace-normal",
  devices: "w-[75%]",
};

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
        id: "devices",
        header: "Supported devices",
        enableSorting: false,
        cell: ({ row }) => {
          const preview = row.original.devices.slice(0, 6);
          const hidden = row.original.devices.length - preview.length;
          return (
            <div className="flex flex-wrap gap-1.5">
              {preview.map((device) => (
                <ChipLink
                  key={`${device.vendor}-${device.codename}`}
                  to={`/devices/${device.vendor}/${device.codename}`}
                >
                  {device.name ?? device.codename}
                </ChipLink>
              ))}
              {hidden > 0 && (
                <ChipLink
                  to={`/roms/${row.original.id}`}
                  className="text-muted-foreground"
                >
                  +{hidden} more
                </ChipLink>
              )}
            </div>
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
      columnClassName={(id) => COLUMN_WIDTHS[id]}
      tableClassName="table-fixed min-w-[40rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "name", desc: false }],
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
