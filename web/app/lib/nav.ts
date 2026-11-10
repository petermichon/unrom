import {
  fetchBrands,
  fetchDevicesPage,
  fetchRoms,
  fetchRomSummaries,
  fetchSummary,
} from "@/lib/data";

export type NavKind = "devices" | "roms";

export interface NavItem {
  to: string;
  label: string;
  kind: NavKind;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/devices", label: "Devices", kind: "devices" },
  { to: "/roms", label: "ROMs", kind: "roms" },
];

// Warm the destination's data on intent. The router's own page-data prefetch
// does not run client loaders, so this is what makes the click instant.
export const NAV_PRELOADS: Record<string, () => Promise<unknown>> = {
  "/devices": () =>
    Promise.all([
      fetchSummary(),
      fetchBrands(),
      fetchDevicesPage({ sort: "coverage", limit: 200, offset: 0 }),
    ]),
  "/roms": () => Promise.all([fetchRoms(), fetchRomSummaries()]),
};
