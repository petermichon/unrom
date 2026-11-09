import { existsSync, readFileSync } from "node:fs";

/**
 * URLs a reference check found dead. A missing file means "nothing known dead"
 * so a fresh checkout still builds; a malformed one is an error, because
 * silently ignoring it would republish citations we meant to drop.
 */
export function readDeadReferences(path: string): ReadonlySet<string> {
  if (!existsSync(path)) return new Set();

  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  const dead = (parsed as { dead?: unknown } | null)?.dead;
  if (!Array.isArray(dead) || dead.some((url) => typeof url !== "string")) {
    throw new Error(`${path}: expected { "dead": string[] }`);
  }
  return new Set(dead as string[]);
}
