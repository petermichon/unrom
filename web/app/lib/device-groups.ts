/**
 * Device groups are properties of a device–ROM pair: a single device can
 * satisfy several groups, and none of them ranks hardware or projects.
 * The URL namespace is deliberately separate from `/devices/:vendor`.
 */
export interface DeviceGroupFilters {
  hardened?: boolean;
  relock?: "supported";
  updatedWithinDays?: number;
  hasRoms?: boolean;
}

export interface DeviceGroup {
  id: string;
  path: string;
  /** Short name used in switches and breadcrumbs. */
  name: string;
  /** Page heading and ItemList name. */
  heading: string;
  /** Full document title. */
  title: string;
  /** Meta description and page summary. */
  description: string;
  /** One line for the groups index. */
  summary: string;
  filters: DeviceGroupFilters;
}

export const GROUP_PAGE_SIZE = 200;

export const DEVICE_GROUPS: readonly DeviceGroup[] = [
  {
    id: "hardened",
    path: "/device-groups/hardened",
    name: "Hardened",
    heading: "Hardened devices",
    title: "Hardened Android devices | unrom",
    description:
      "Android devices with a ROM that documents its security patches, exploit mitigations and relock support.",
    summary: "ROMs that document patches, mitigations and relock support.",
    filters: { hardened: true },
  },
  {
    id: "relock-supported",
    path: "/device-groups/relock-supported",
    name: "Relock supported",
    heading: "Relock supported devices",
    title: "Android devices with relock support | unrom",
    description:
      "Android devices with at least one custom ROM that documents locking the bootloader again after installation.",
    summary: "A project documents a relock path.",
    filters: { relock: "supported" },
  },
  {
    id: "recently-updated",
    path: "/device-groups/recently-updated",
    name: "Recently updated",
    heading: "Recently updated devices",
    title: "Recently updated custom ROM devices | unrom",
    description:
      "Android devices with a custom ROM build published in the last 90 days.",
    summary: "A build in the last 90 days.",
    filters: { updatedWithinDays: 90 },
  },
  {
    id: "with-roms",
    path: "/device-groups/with-roms",
    name: "Devices with ROMs",
    heading: "Devices with ROMs",
    title: "Android devices with custom ROMs | unrom",
    description:
      "Android devices with at least one custom ROM build in the unrom database.",
    summary: "At least one ROM build recorded.",
    filters: { hasRoms: true },
  },
];

export const GROUPS_TITLE = "Android device groups | unrom";
export const GROUPS_DESCRIPTION =
  "Browse Android devices by a property of their ROM support: hardening, relock support, recent builds and ROM coverage. Groups describe coverage, not quality.";

export function deviceGroup(id: string): DeviceGroup | undefined {
  return DEVICE_GROUPS.find((group) => group.id === id);
}

export function groupHref(
  group: DeviceGroup,
  { q, page }: { q?: string; page?: number } = {},
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${group.path}?${search}` : group.path;
}
