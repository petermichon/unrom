import { getTableConfig } from "drizzle-orm/sqlite-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { tables } from "./schema.ts";

// Drizzle stores SQLite types by their TypeScript constructor name; map the
// ones this schema uses. Add entries here if a new column type is introduced.
const TYPE_MAP: Record<string, string> = {
  SQLiteText: "text",
  SQLiteTextJson: "text",
  SQLiteInteger: "integer",
  SQLiteBoolean: "integer",
  SQLiteReal: "real",
  SQLiteBlob: "blob",
  SQLiteBlobJson: "blob",
  SQLiteNumeric: "numeric",
};

function columnType(columnType: string): string {
  return TYPE_MAP[columnType] ?? "text";
}

function quote(name: string): string {
  return `\`${name}\``;
}

// Index columns are typed as `SQLiteColumn | SQL`; our indexes always reference
// a column, so read its name and fall back to the raw SQL for anything else.
function indexColumnName(column: unknown): string {
  if (column !== null && typeof column === "object" && "name" in column) {
    const name = (column as { name: unknown }).name;
    if (typeof name === "string") return name;
  }
  return String(column);
}

/**
 * Derive `CREATE TABLE`/`CREATE INDEX` SQL from the Drizzle schema so there is a
 * single source of truth (`schema.ts`). The output is executed when building the
 * disposable database and shipped as `schema.sql` with the exports.
 */
export function generateDdl(): string {
  const statements: string[] = [];

  for (const table of tables as readonly SQLiteTable[]) {
    const config = getTableConfig(table);

    const columns = config.columns.map((column) => {
      const parts = [quote(column.name), columnType(column.columnType)];
      if (column.primary) parts.push("PRIMARY KEY");
      if (column.notNull) parts.push("NOT NULL");
      return `  ${parts.join(" ")}`;
    });

    for (const primaryKey of config.primaryKeys) {
      const names = primaryKey.columns.map((c) => quote(c.name)).join(", ");
      columns.push(`  PRIMARY KEY(${names})`);
    }

    statements.push(
      `CREATE TABLE ${quote(config.name)} (\n${columns.join(",\n")}\n);`,
    );

    for (const index of config.indexes) {
      const names = index.config.columns
        .map((c) => quote(indexColumnName(c)))
        .join(", ");
      const unique = index.config.unique ? "UNIQUE " : "";
      statements.push(
        `CREATE ${unique}INDEX ${quote(index.config.name)} ON ${quote(
          config.name,
        )} (${names});`,
      );
    }
  }

  return statements.join("\n") + "\n";
}
