import {
  DIRECTORY_PAGE_SIZE,
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
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/devices", label: "Devices", kind: "devices" },
  { to: "/brands", label: "Brands", kind: "brands" },
  { to: "/roms", label: "Custom ROMs", kind: "roms" },
];

/**
 * The ROMs pinned in the menu, in order: the featured chip first, then the
 * shortcut list. Chosen, not sorted by device count; labels are the catalogue
 * names for these ids. The menu is static, so a project that is renamed or
 * discontinued is corrected here, not hidden by a fetch.
 */
export const MENU_ROMS = [
  {
    id: "grapheneos",
    name: "GrapheneOS",
    description: "Hardened Android",
  },
  {
    id: "calyxos",
    name: "CalyxOS",
    description: "Privacy-focused Android",
  },
  { id: "iode", name: "iodéOS", description: "Privacy-focused Android" },
  { id: "eos", name: "/e/OS", description: "De-Googled Android" },
  { id: "lineageos", name: "LineageOS", description: "Community Android" },
] as const;

/**
 * The vendors pinned in the menu, in order. Chosen, not sorted by coverage;
 * labels are the vendor names as the catalogue spells them, and each
 * description names the lineup rather than making a claim. Static like the ROM
 * pins, so the menu stays usable without the API.
 */
export const MENU_BRANDS = [
  { id: "google", name: "Google", description: "Pixel phones and tablets" },
  { id: "xiaomi", name: "Xiaomi", description: "Xiaomi, Redmi and POCO" },
  { id: "samsung", name: "Samsung", description: "Galaxy phones and tablets" },
  { id: "oneplus", name: "OnePlus", description: "OnePlus phones and tablets" },
  { id: "sony", name: "Sony", description: "Xperia phones" },
  { id: "motorola", name: "Motorola", description: "Moto G, Edge and Razr" },
  { id: "nothing", name: "Nothing", description: "Nothing and CMF phones" },
  { id: "fairphone", name: "Fairphone", description: "User-repairable phones" },
] as const;

// Warm the destination's data on intent. The router's own page-data prefetch
// does not run client loaders, so this is what makes the click instant.
export const NAV_PRELOADS: Record<string, () => Promise<unknown>> = {
  "/devices": () =>
    Promise.all([
      fetchSummary(),
      fetchBrands(),
      fetchDevicesPage({
        sort: "roms",
        limit: DIRECTORY_PAGE_SIZE,
        offset: 0,
      }),
    ]),
  "/brands": () => fetchBrands(),
  "/roms": () => Promise.all([fetchRoms(), fetchRomSummaries()]),
};
