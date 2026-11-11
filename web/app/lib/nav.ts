import {
  fetchApiIndex,
  fetchBrands,
  fetchDevicesPage,
  fetchRoms,
  fetchRomSummaries,
  fetchSummary,
} from "@/lib/data";

export type NavKind = "devices" | "brands" | "roms" | "data";

export interface NavItem {
  to: string;
  label: string;
  kind: NavKind;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/devices", label: "Devices", kind: "devices" },
  { to: "/brands", label: "Brands", kind: "brands" },
  { to: "/roms", label: "ROMs", kind: "roms" },
  { to: "/data", label: "Data", kind: "data" },
];

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
  "/data": () => fetchApiIndex(),
};
