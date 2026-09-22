import { Fragment, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
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
import type { BrowseDevice } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["names", "aliases", "group"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  devices: BrowseDevice[];
}

function Codenames({ vendor, values }: { vendor: string; values: string[] }) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="font-mono text-xs text-muted-foreground whitespace-normal break-words">
      {values.map((codename, index) => (
        <Fragment key={codename}>
          {index > 0 ? ", " : ""}
          <Link
            to={`/devices/${vendor}/${codename}`}
            prefetch="intent"
            className="hover:text-foreground hover:underline"
          >
            {codename}
          </Link>
        </Fragment>
      ))}
    </span>
  );
}

export default function RegistryTable({ devices }: Props) {
  const vendorOptions = useMemo<FacetOption[]>(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const device of devices) {
      const entry = counts.get(device.vendor) ?? {
        name: device.vendorName,
        count: 0,
      };
      entry.count++;
      counts.set(device.vendor, entry);
    }
    return [...counts]
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([value, entry]) => ({ label: entry.name, value }));
  }, [devices]);

  const columns = useMemo<ColumnDef<BrowseDevice>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [
            row.name,
            ...row.names,
            row.codename,
            row.vendor,
            row.vendorName,
            ...row.aliases,
            ...row.group,
          ]
            .filter(Boolean)
            .join(" "),
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        id: "vendor",
        accessorFn: (row) => row.vendorName,
        meta: { title: "Vendor" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor" />
        ),
        cell: ({ row }) => (
          <Link
            to={`/devices/${row.original.vendor}`}
            prefetch="intent"
            className="w-fit max-w-full truncate text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </Link>
        ),
        filterFn: (row, _id, value: string[]) =>
          value.includes(row.original.vendor),
      },
      {
        id: "device",
        accessorFn: (row) => row.name ?? row.codename,
        meta: { title: "Device" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <Link
              to={`/devices/${row.original.vendor}/${row.original.codename}`}
              prefetch="intent"
              className="w-fit max-w-full truncate font-medium hover:underline"
            >
              {row.original.name ?? row.original.codename}
            </Link>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {row.original.codename}
            </span>
          </div>
        ),
      },
      {
        id: "names",
        accessorFn: (row) => row.names.join(" / "),
        meta: { title: "Names" },
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Names" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-normal break-words">
            {row.original.names.length > 0
              ? row.original.names.join(" / ")
              : "—"}
          </span>
        ),
      },
      {
        id: "aliases",
        accessorFn: (row) => row.aliases.join(" "),
        meta: { title: "Renames" },
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Renames" />
        ),
        cell: ({ row }) => (
          <Codenames
            vendor={row.original.vendor}
            values={row.original.aliases}
          />
        ),
      },
      {
        id: "group",
        accessorFn: (row) => row.group.join(" "),
        meta: { title: "Compatibility" },
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Compatibility" />
        ),
        cell: ({ row }) => (
          <Codenames
            vendor={row.original.vendor}
            values={row.original.group.filter(
              (codename) => codename !== row.original.codename,
            )}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={devices}
      columnClassName={columnClassName}
      tableClassName="min-w-[36rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "vendor", desc: false }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="registry-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter by name or codename…"
            ariaLabel="Filter the registry"
          />
          {table.getColumn("vendor") && (
            <DataTableFacetedFilter
              column={table.getColumn("vendor")!}
              title="Vendor"
              options={vendorOptions}
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
