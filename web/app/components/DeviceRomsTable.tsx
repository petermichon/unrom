import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
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
import { StatusBadge } from "@/components/StatusBadge";
import { VersionChips } from "@/components/VersionChips";
import { Button } from "@/components/ui/button";
import { bySortKey } from "@/lib/sort";
import type { RomSupport } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["versions", "maintainer", "sourceUrl"]);
const COLUMN_WIDTHS: Record<string, string> = {
  search: "w-0",
  name: "w-[26%] whitespace-normal",
  active: "w-[12%]",
  versions: "w-[26%]",
  maintainer: "w-[20%]",
  sourceUrl: "w-[16%]",
};
const columnClassName = (id: string) =>
  [MOBILE_HIDDEN.has(id) && "hidden md:table-cell", COLUMN_WIDTHS[id]]
    .filter(Boolean)
    .join(" ") || undefined;

const statusOptions: FacetOption[] = [
  { label: "Active", value: "true" },
  { label: "Discontinued", value: "false" },
];

interface Props {
  roms: RomSupport[];
}

export default function DeviceRomsTable({ roms }: Props) {
  const columns = useMemo<ColumnDef<RomSupport>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [row.name, row.maintainer, ...row.romVersions, ...row.androidBases]
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
        accessorKey: "active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(String(row.getValue(id))),
        cell: ({ row }) => <StatusBadge active={row.original.active} />,
      },
      {
        id: "versions",
        accessorFn: (row) =>
          [...row.romVersions, ...row.androidBases].filter(Boolean).join(", "),
        header: "Versions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <VersionChips
              androidBases={row.original.androidBases}
              romVersions={row.original.romVersions}
            />
          </div>
        ),
      },
      {
        accessorKey: "maintainer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Maintainer" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.maintainer ?? "—"}
          </span>
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
      tableClassName="table-fixed min-w-[44rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [
          { id: "active", desc: true },
          { id: "name", desc: false },
        ],
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
          {table.getColumn("active") && (
            <DataTableFacetedFilter
              column={table.getColumn("active")!}
              title="Status"
              options={statusOptions}
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
