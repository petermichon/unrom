import {
  fetchBrands,
  fetchDevicesPage,
  fetchRoms,
  fetchRomSummaries,
  fetchSummary,
} from "@/lib/data";

export type NavKind = "devices" | "brands" | "roms";

export interface NavItem {
  to: string;
  label: string;
  kind: NavKind;
  /** One line of context, used by the mobile sheet. */
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/devices",
    label: "Devices",
    kind: "devices",
    description: "Every tracked device and the ROMs it can run",
  },
  {
    to: "/brands",
    label: "Brands",
    kind: "brands",
    description: "Vendors ordered by ROM coverage",
  },
  {
    to: "/roms",
    label: "ROMs",
    kind: "roms",
    description: "Projects and the devices they support",
  },
];

/**
 * The ROMs pinned in the menu, in order: the featured chip first, then the
 * shortcut list. Chosen, not sorted by device count; labels are the catalogue
 * names for these ids.
 */
export const MENU_ROMS = [
  {
    id: "grapheneos",
    name: "GrapheneOS",
    description: "Pixel devices, official builds",
  },
  { id: "calyxos", name: "CalyxOS", description: "Pixels and Fairphones" },
  { id: "iode", name: "iodéOS", description: "Privacy-focused Android" },
  { id: "eos", name: "/e/OS", description: "Installer-supported devices" },
  { id: "lineageos", name: "LineageOS", description: "Broad device coverage" },
] as const;

// Warm the destination's data on intent. The router's own page-data prefetch
// does not run client loaders, so this is what makes the click instant.
export const NAV_PRELOADS: Record<string, () => Promise<unknown>> = {
  "/devices": () =>
    Promise.all([
      fetchSummary(),
      fetchBrands(),
      fetchDevicesPage({ sort: "roms", limit: 200, offset: 0 }),
    ]),
  "/brands": () => fetchBrands(),
  "/roms": () => Promise.all([fetchRoms(), fetchRomSummaries()]),
};
