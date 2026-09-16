import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { ChipLink } from "@/components/ChipLink";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DataTableFacetedFilter,
  type FacetOption,
} from "@/components/data-table/data-table-faceted-filter";
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
  brands: "w-0",
};
const columnClassName = (id: string) => COLUMN_WIDTHS[id];

// Long ROM device lists are truncated to keep the table scannable; the full
// list lives on the ROM detail page.
const DEVICE_PREVIEW = 6;

interface Props {
  roms: RomDetail[];
}

export default function RomsTable({ roms }: Props) {
  const brandOptions = useMemo<FacetOption[]>(() => {
    const set = new Set(
      roms
        .flatMap((rom) => rom.devices.map((device) => device.brand))
        .filter((value): value is string => Boolean(value)),
    );
    return [...set].sort().map((value) => ({ label: value, value }));
  }, [roms]);

  const columns = useMemo<ColumnDef<RomDetail>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [
            row.name,
            ...row.devices.flatMap((device) => [
              device.name,
              device.codename,
              device.brand,
            ]),
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
          const preview = row.original.devices.slice(0, DEVICE_PREVIEW);
          const hidden = row.original.devices.length - preview.length;
          return (
            <div className="flex flex-wrap gap-1.5">
              {preview.map((device) => (
                <ChipLink
                  key={device.codename}
                  to={`/devices/${device.codename}`}
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
      {
        id: "brands",
        accessorFn: (row) => [
          ...new Set(
            row.devices
              .map((device) => device.brand)
              .filter((value): value is string => Boolean(value)),
          ),
        ],
        header: "",
        enableSorting: false,
        enableHiding: false,
        filterFn: (row, id, value: string[]) =>
          (row.getValue(id) as string[]).some((value2) =>
            value.includes(value2),
          ),
        cell: () => null,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={roms}
      columnClassName={columnClassName}
      tableClassName="table-fixed min-w-[40rem]"
      initialState={{
        columnVisibility: { search: false, brands: false },
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
          {table.getColumn("brands") && (
            <DataTableFacetedFilter
              column={table.getColumn("brands")!}
              title="Brand"
              options={brandOptions}
            />
          )}
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
