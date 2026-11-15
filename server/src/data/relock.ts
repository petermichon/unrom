import type { RelockInfo } from "@unrom/contract";

export interface RelockRule {
  romId: string;
  scope: RelockInfo["scope"];
  /** Device-scoped rules only. */
  vendor?: string;
  codename?: string;
  status: RelockInfo["status"];
  /** The project's own wording, kept alongside the status. */
  summary: string;
  sourceUrl: string;
  verifiedAt: string;
}

/**
 * Curated from the projects' own documentation. A locked bootloader binds the
 * device to that ROM's keys, so this is a statement about the project's install
 * path, not a device capability. Read them on `/data` before relying on one.
 */
export const RELOCK_RULES: RelockRule[] = [
  {
    romId: "grapheneos",
    scope: "rom",
    status: "supported",
    summary:
      "Locking the bootloader after installation is part of the documented setup; the keys are GrapheneOS's own.",
    sourceUrl: "https://grapheneos.org/faq#bootloader-locking-setup",
    verifiedAt: "2026-11-15",
  },
  {
    romId: "calyxos",
    scope: "rom",
    status: "supported",
    summary:
      "CalyxOS is meant to be run with a locked bootloader after installation.",
    sourceUrl: "https://calyxos.org/install/",
    verifiedAt: "2026-11-15",
  },
];

/**
 * The most specific statement covering a ROM on a device: `rom + device`, then
 * `device`, then the ROM-wide rule. Null means no project statement covers the
 * pair, which is not the same as "cannot be relocked".
 */
export function resolveRelock(
  rules: RelockRule[],
  romId: string,
  vendor: string,
  codename: string,
): RelockInfo | null {
  const matching = rules.filter((rule) => rule.romId === romId);
  const device = matching.find(
    (rule) =>
      rule.scope === "device" &&
      rule.vendor === vendor &&
      (rule.codename === null ||
        rule.codename === undefined ||
        rule.codename === codename),
  );
  const chosen = device ?? matching.find((rule) => rule.scope === "rom");
  if (!chosen) return null;

  return {
    status: chosen.status,
    summary: chosen.summary,
    sourceUrl: chosen.sourceUrl,
    verifiedAt: chosen.verifiedAt,
    scope: chosen.scope,
  };
}

export function relockFor(
  romId: string,
  vendor: string,
  codename: string,
): RelockInfo | null {
  return resolveRelock(RELOCK_RULES, romId, vendor, codename);
}
