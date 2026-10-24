import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import type { RegistryCandidate, RegistryReport } from "./database.ts";
import { REGISTRY_REPORT_PATH } from "../paths.ts";

const key = (entry: RegistryCandidate) =>
  `${entry.vendor}\\0${entry.codename}`;

function findVendor(report: RegistryReport, name: string): string | null {
  const needle = name.trim().toLowerCase();
  const match = report.candidates.find(
    (entry) =>
      entry.vendor.toLowerCase() === needle ||
      entry.vendorName.toLowerCase() === needle,
  );
  return match?.vendor ?? null;
}

export function formatVendor(report: RegistryReport, vendor: string): string {
  const rows = report.candidates
    .filter((entry) => entry.vendor === vendor)
    .sort((a, b) => a.codename.localeCompare(b.codename));
  if (rows.length === 0) {
    throw new Error(`unknown or fully curated vendor: ${vendor}`);
  }

  const safe: RegistryCandidate[] = [];
  const conflicts: RegistryCandidate[] = [];
  const review: RegistryCandidate[] = [];

  for (const entry of rows) {
    if (entry.conflict) conflicts.push(entry);
    else if (entry.suspicious) review.push(entry);
    else safe.push(entry);
  }

  const lines = [
    `// ${rows[0].vendorName} (${vendor}): ${safe.length} ready, ` +
      `${conflicts.length} conflict(s), ${review.length} need review.`,
  ];

  if (safe.length > 0) {
    lines.push("");
    for (const entry of safe) {
      lines.push(`  "${key(entry)}": ${JSON.stringify([entry.name])},`);
    }
  }

  if (conflicts.length > 0) {
    lines.push("");
    lines.push("  // Conflicts: sources disagree. Pick one name and uncomment.");
    for (const entry of conflicts) {
      lines.push(`  // ${entry.codename}:`);
      for (const source of entry.sources) {
        lines.push(
          `  //   ${JSON.stringify(source.name)} — ${source.romIds.join(", ")}`,
        );
      }
      lines.push(
        `  // "${key(entry)}": ${JSON.stringify([entry.sources[0]?.name ?? entry.codename])},`,
      );
    }
  }

  if (review.length > 0) {
    lines.push("");
    lines.push("  // Needs review: the reported name is not usable as-is.");
    for (const entry of review) {
      lines.push(
        `  // ${entry.codename}: ${JSON.stringify(entry.name)} (${entry.issues.join(", ")})`,
      );
      lines.push(
        `  // "${key(entry)}": ${JSON.stringify([entry.name ?? entry.codename])},`,
      );
    }
  }

  return lines.join("\n");
}

export function formatSummary(report: RegistryReport): string {
  const vendors = new Map<
    string,
    { name: string; devices: number; conflicts: number }
  >();
  for (const entry of report.candidates) {
    const row = vendors.get(entry.vendor) ?? {
      name: entry.vendorName,
      devices: 0,
      conflicts: 0,
    };
    row.devices++;
    if (entry.conflict) row.conflicts++;
    vendors.set(entry.vendor, row);
  }

  const width = Math.max(6, ...[...vendors.values()].map((v) => v.name.length));
  const lines = [
    `${report.candidates.length} uncurated device(s), ` +
      `${report.conflicts.length} conflict(s).`,
    "",
    `  ${"Vendor".padEnd(width)}  Devices  Conflicts`,
  ];
  for (const [vendor, row] of [...vendors].sort(([, a], [, b]) =>
    a.name.localeCompare(b.name),
  )) {
    lines.push(
      `  ${row.name.padEnd(width)}  ${String(row.devices).padStart(7)}  ${String(row.conflicts).padStart(9)}  (${vendor})`,
    );
  }
  lines.push("", "Run: npm run registry:suggest -- <vendor>");
  return lines.join("\n");
}

async function main(): Promise<void> {
  let report: RegistryReport;
  try {
    report = JSON.parse(
      await readFile(REGISTRY_REPORT_PATH, "utf8"),
    ) as RegistryReport;
  } catch {
    console.error(
      `No report at ${REGISTRY_REPORT_PATH}. Build it first: npm run build:data`,
    );
    process.exitCode = 1;
    return;
  }

  const requested = process.argv[2];
  if (!requested) {
    console.log(formatSummary(report));
    return;
  }

  const vendor = findVendor(report, requested);
  if (!vendor) {
    console.error(`Unknown vendor: ${requested}. Run without an argument to list.`);
    process.exitCode = 1;
    return;
  }

  console.log(formatVendor(report, vendor));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
