import { readFile, writeFile } from "node:fs/promises";

import { SOURCE_HEALTH_PATH } from "../paths.ts";
import type { Source } from "./sources.ts";

// Per-source fetch health. A snapshot that stops refreshing is
// indistinguishable from a project that stopped shipping builds, so the last
// successful fetch is recorded per source and committed with the snapshots. The
// audit (`check:sources`) turns a source that has gone quiet into a finding:
// either the latest attempt failed, or the last success is older than the
// allowed age.

export interface SourceHealthEntry {
  id: string;
  file: string;
  /** When the source last returned data. Null if it never has. */
  lastSuccessAt: string | null;
  /** The error of the most recent attempt, cleared by a successful one. */
  lastError: string | null;
}

export interface SourceHealth {
  sources: SourceHealthEntry[];
}

export type SourceAttempt =
  | { id: string; file: string; ok: true }
  | { id: string; file: string; ok: false; error: string };

function byFile(a: SourceHealthEntry, b: SourceHealthEntry): number {
  return a.file.localeCompare(b.file);
}

/**
 * Fold this run's attempts into the recorded health. Sources that were not run
 * keep their entry: fetching one source must not erase what the others
 * recorded.
 */
export function updateHealth(
  previous: readonly SourceHealthEntry[],
  attempts: readonly SourceAttempt[],
  now: Date,
): SourceHealthEntry[] {
  const entries = new Map(previous.map((entry) => [entry.file, { ...entry }]));
  const fetchedAt = now.toISOString();

  for (const attempt of attempts) {
    const recorded = entries.get(attempt.file) ?? {
      id: attempt.id,
      file: attempt.file,
      lastSuccessAt: null,
      lastError: null,
    };
    if (attempt.ok) {
      recorded.lastSuccessAt = fetchedAt;
      recorded.lastError = null;
    } else {
      recorded.lastError = attempt.error;
    }
    entries.set(attempt.file, recorded);
  }

  return [...entries.values()].sort(byFile);
}

export type HealthState = "ok" | "failed" | "stale" | "never";

export interface HealthFinding {
  id: string;
  file: string;
  state: HealthState;
  /** Whole days since the last successful fetch, null if there has been none. */
  ageDays: number | null;
  lastSuccessAt: string | null;
  lastError: string | null;
}

export interface HealthAudit {
  findings: HealthFinding[];
  /** Recorded sources that the registry no longer fetches. */
  orphans: string[];
}

const DAY_MS = 86_400_000;

/**
 * Compare the recorded health with the registry. A source is a finding when its
 * latest attempt failed (`failed`), it has never returned data (`never`), or its
 * last success is older than `maxAgeDays` (`stale`).
 */
export function auditHealth(
  entries: readonly SourceHealthEntry[],
  sources: readonly Pick<Source, "id" | "file">[],
  now: Date,
  maxAgeDays: number,
): HealthAudit {
  const bySourceFile = new Map(entries.map((entry) => [entry.file, entry]));
  const findings: HealthFinding[] = [];

  for (const source of sources) {
    const entry = bySourceFile.get(source.file);
    if (!entry) {
      findings.push({
        id: source.id,
        file: source.file,
        state: "never",
        ageDays: null,
        lastSuccessAt: null,
        lastError: null,
      });
      continue;
    }

    const successAt = entry.lastSuccessAt
      ? Date.parse(entry.lastSuccessAt)
      : NaN;
    const ageDays = Number.isNaN(successAt)
      ? null
      : Math.floor((now.getTime() - successAt) / DAY_MS);

    let state: HealthState = "ok";
    if (entry.lastError) state = "failed";
    else if (ageDays === null || ageDays > maxAgeDays) state = "stale";

    findings.push({
      id: source.id,
      file: source.file,
      state,
      ageDays,
      lastSuccessAt: entry.lastSuccessAt,
      lastError: entry.lastError,
    });
  }

  const known = new Set(sources.map((source) => source.file));
  const orphans = entries
    .filter((entry) => !known.has(entry.file))
    .map((entry) => entry.file)
    .sort();

  return { findings, orphans };
}

/** Recorded health, or none when the file has not been written yet. */
export async function readSourceHealth(
  path = SOURCE_HEALTH_PATH,
): Promise<SourceHealthEntry[]> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);
  const sources = (parsed as SourceHealth | null)?.sources;
  if (!Array.isArray(sources)) {
    throw new Error(`${path}: expected { "sources": [...] }`);
  }
  return sources as SourceHealthEntry[];
}

export async function writeSourceHealth(
  entries: readonly SourceHealthEntry[],
  path = SOURCE_HEALTH_PATH,
): Promise<void> {
  const health: SourceHealth = { sources: [...entries].sort(byFile) };
  await writeFile(path, `${JSON.stringify(health, null, 2)}\n`, "utf8");
}
