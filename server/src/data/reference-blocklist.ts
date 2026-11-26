import { existsSync, readFileSync } from "node:fs";

export interface BlockedHost {
  host: string;
  added: string;
  reason: string;
}

/**
 * Hosts whose citations must not be published. Unlike
 * `reference-overrides.json`, this file is curated by hand: it records a host
 * no visitor can reach at all (a broken domain), which an HTTP probe can only
 * see as "unknown" and therefore never drops. Keeping it separate means the
 * refresh cannot rewrite a decision that was made on DNS evidence.
 *
 * A missing file means "nothing blocked" so a fresh checkout still builds; a
 * malformed one is an error, because ignoring it would republish citations we
 * meant to drop.
 */
export function readBlockedHosts(path: string): readonly BlockedHost[] {
  if (!existsSync(path)) return [];

  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  const hosts = (parsed as { hosts?: unknown } | null)?.hosts;
  if (!Array.isArray(hosts)) {
    throw new Error(`${path}: expected { "hosts": [{ "host": string }] }`);
  }

  return hosts.map((entry) => {
    const host = (entry as { host?: unknown } | null)?.host;
    const added = (entry as { added?: unknown } | null)?.added;
    const reason = (entry as { reason?: unknown } | null)?.reason;
    if (
      typeof host !== "string" ||
      !/^[a-z0-9.-]+$/.test(host) ||
      typeof added !== "string" ||
      typeof reason !== "string" ||
      !reason
    ) {
      throw new Error(
        `${path}: each host needs a bare lowercase name, an "added" date and a "reason"`,
      );
    }
    return { host, added, reason };
  });
}

/** True when `host` is a blocked host or a subdomain of one. */
export function isBlockedHost(
  host: string,
  blocked: readonly BlockedHost[],
): boolean {
  return blocked.some(
    (entry) => host === entry.host || host.endsWith(`.${entry.host}`),
  );
}
