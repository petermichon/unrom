// Device identity. A codename is only unique per vendor (manufacturer), not
// globally — e.g. `sirius` is both a Sony and a Xiaomi device — so devices are
// keyed by `(vendor, codename)`. Vendors are derived from the marketing brand
// sources report; `null` means the source omitted it and it is inherited from
// the same codename elsewhere.
//
// Canonical casing follows the most authoritative source for each device
// (LineageOS / PixelExperience / Evolution X where available).
export const CANONICAL_CODENAMES: Record<string, string> = {
  dubai: "dubai",
  Dubai: "dubai",
  f62: "f62",
  F62: "f62",
  miami: "miami",
  Miami: "miami",
  Pong: "Pong",
  pong: "Pong",
  Spacewar: "Spacewar",
  spacewar: "Spacewar",
  drg: "DRG",
  DRG: "DRG",
  pl2: "PL2",
  PL2: "PL2",
  rmx1971: "RMX1971",
  RMX1971: "RMX1971",
  Mi439: "Mi439",
  mi439: "Mi439",
  Tetris: "Tetris",
  tetris: "Tetris",
  asteroids: "asteroids",
  Asteroids: "asteroids",
};

// Marketing brand (as reported by sources) → manufacturer. Casing variants are
// folded here rather than in the data so brand casing stays canonical.
const VENDOR_BY_BRAND: Record<string, string> = {
  "10.or": "10or",
  "10or": "10or",
  ark: "ark",
  asus: "asus",
  ayn: "ayn",
  "banana pi": "bananapi",
  bluefox: "bluefox",
  bq: "bq",
  droidlogic: "droidlogic",
  dynalink: "dynalink",
  essential: "essential",
  "f(x)tec": "fxtec",
  fairphone: "fairphone",
  freebox: "freebox",
  genric: "genric",
  google: "google",
  hardkernel: "hardkernel",
  htc: "htc",
  huawei: "huawei",
  infinix: "infinix",
  itel: "itel",
  jiayu: "jiayu",
  leeco: "leeco",
  lenovo: "lenovo",
  lg: "lg",
  lge: "lg",
  meizu: "meizu",
  mi: "xiaomi",
  micromax: "micromax",
  mobvoi: "mobvoi",
  motorola: "motorola",
  moto: "motorola",
  nextbit: "nextbit",
  nintendo: "nintendo",
  nokia: "nokia",
  nothing: "nothing",
  nubia: "nubia",
  nvidia: "nvidia",
  oneplus: "oneplus",
  oppo: "oppo",
  osom: "osom",
  poco: "xiaomi",
  "poco & redmi": "xiaomi",
  pocophone: "xiaomi",
  "planet computers": "planetcomputers",
  qualcomm: "qualcomm",
  radxa: "radxa",
  razer: "razer",
  realme: "realme",
  redmi: "xiaomi",
  "retroid pocket": "retroid",
  samsung: "samsung",
  shift: "shift",
  smartisan: "smartisan",
  solana: "solana",
  sony: "sony",
  tecno: "tecno",
  teracube: "teracube",
  ticwatch: "mobvoi",
  vsmart: "vsmart",
  walmart: "walmart",
  wileyfox: "wileyfox",
  wingtech: "wingtech",
  xiaomi: "xiaomi",
  yandex: "yandex",
  yu: "yu",
  zinwa: "zinwa",
  zte: "zte",
  zuk: "lenovo",
};

// Manufacturer for a brand, or null when the source omitted/uses an unknown
// brand (the caller inherits it from the same codename elsewhere).
export function vendorForBrand(brand: string | null): string | null {
  if (!brand) return null;
  return VENDOR_BY_BRAND[brand.trim().toLowerCase()] ?? null;
}

// Fallback when a source omits the brand: derive it from the device name's
// leading token(s) (e.g. "Samsung Galaxy A53 5G" → samsung).
export function vendorForName(name: string | null): string | null {
  if (!name) return null;
  const words = name.trim().split(/\s+/);
  for (const count of [2, 1]) {
    const key = words.slice(0, count).join(" ").toLowerCase();
    const vendor = VENDOR_BY_BRAND[key];
    if (vendor) return vendor;
  }
  return null;
}

// A few codenames only ever appear without a brand. Seed their vendor so they
// do not fall into the `unknown` bucket. (Confirmed against the /e/OS device
// docs, LineageOS wiki, iodéOS and the ArrowOS build targets.)
const VENDOR_BY_CODENAME: Record<string, string> = {
  sapphire: "xiaomi",
  "2e": "teracube",
  brax3: "brax",
  dreamlte: "samsung",
  dream2lte: "samsung",
  elish: "xiaomi",
  emerald: "teracube",
  gs290: "gigaset",
  gs6_venus: "gigaset",
  mimir: "volla",
  one: "murena",
  oscar: "realme",
  tulip: "xiaomi",
  two: "murena",
  zirconia: "teracube",
};

export function vendorForCodename(codename: string): string | null {
  return VENDOR_BY_CODENAME[codename.toLowerCase()] ?? null;
}

// Build targets that are not real devices: emulator images and unified trees
// covering several devices. Dropping them keeps phantom rows out of `devices`.
export const EXCLUDED_CODENAMES = new Set<string>([
  "sdk_phone_x86_64",
  "opkona",
  "gsi_gapps",
  "gsi_vanilla",
]);

export const UNKNOWN_VENDOR = "unknown";

// Some sources pack several codenames into one entry with "/", because one
// build covers several variants (e.g. `ginkgo/willow` = Redmi Note 8 / 8T).
// Every part is a device of its own, so keep them all. Only tokens that are not
// codenames (`in`, a region marker in `raphael/in`) are dropped.
const COMBINED_CODENAMES: Record<string, string[]> = {
  "ginkgo/willow": ["ginkgo", "willow"],
  "haydnin/haydn": ["haydnin", "haydn"],
  "mojito/sunny": ["mojito", "sunny"],
  "raphael/in": ["raphael"],
  "sapphire/sapphiren": ["sapphire", "sapphiren"],
  "vayu/bhima": ["vayu", "bhima"],
};

export function expandCodename(codename: string): string[] {
  const combined = COMBINED_CODENAMES[codename.trim()];
  if (combined) return combined;
  if (!codename.includes("/")) return [codename];
  return codename
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

// `codename_alt` is a loose field: it is often just a duplicate of `codename`,
// and sometimes a vendor identifier (`OnePlus7TPro`) rather than a device. Only
// tokens in this set name a real device variant, so only these are treated as
// additional devices the entry covers.
export const VARIANT_CODENAMES = new Set<string>([
  "aliothin",
  "bhima",
  "courbetin",
  "curtana",
  "davinciin",
  "excalibur",
  "gram",
  "haydnin",
  "joyeuse",
  "karna",
  "lemon",
  "m62",
  "marblein",
  "phoenixin",
  "pomelo",
  "sapphiren",
  "skyin",
  "sweetin",
  "willow",
]);

/** Codenames an entry covers beyond its primary, filtered to real variants. */
export function variantCodenames(
  primary: string,
  alt: string | null | undefined,
): string[] {
  if (!alt) return [];
  return alt
    .split("/")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part !== "" &&
        part.toLowerCase() !== primary.toLowerCase() &&
        VARIANT_CODENAMES.has(part.toLowerCase()),
    );
}

// Device-level coverage verified from the build itself, for facts rosters do
// not always repeat. `TARGET_OTA_ASSERT_DEVICE := sweet,sweetin` in the unified
// `device_xiaomi_sweet` tree means a `sweet` build is valid on `sweetin` too
// (confirmed in LineageOS, crDroid and Evolution X). Rosters that group the
// codenames (RisingOS `sweet/sweetin`, AwakenOS/PixelOS `codename_alt`) declare
// the same; this entry keeps it true if they stop. Keyed `vendor\0codename`.
export const VERIFIED_COVERAGE: Record<string, string[]> = {
  "xiaomi\0sweet": ["sweetin"],
};

// Within a vendor, some sources use a different codename for the same device.
// LineageOS uses `xmsirius` for the Xiaomi Mi 8 SE because `sirius` is Sony's
// Xperia Z2; iodéOS uses `2e` for the Teracube 2e (2020 batch) that /e/OS calls
// `zirconia`. A rename is not a variant: the codenames denote the same device,
// so the edges merge. Map `(vendor, codename)` → canonical.
const VENDOR_CODENAME_ALIASES: Record<string, string> = {
  "teracube\u00002e": "zirconia",
  "xiaomi\0sirius": "xmsirius",
};

export function canonicalCodename(vendor: string, codename: string): string {
  return VENDOR_CODENAME_ALIASES[`${vendor}\0${codename}`] ?? codename;
}

// Display names for vendor slugs.
const VENDOR_NAMES: Record<string, string> = {
  "10or": "10.or",
  ark: "ARK",
  asus: "Asus",
  ayn: "AYN",
  bananapi: "Banana Pi",
  bluefox: "Bluefox",
  brax: "Brax",
  bq: "BQ",
  droidlogic: "DroidLogic",
  dynalink: "Dynalink",
  essential: "Essential",
  fairphone: "Fairphone",
  freebox: "Freebox",
  fxtec: "F(x)tec",
  genric: "Generic",
  gigaset: "Gigaset",
  google: "Google",
  hardkernel: "HardKernel",
  htc: "HTC",
  huawei: "Huawei",
  infinix: "Infinix",
  itel: "Itel",
  jiayu: "Jiayu",
  leeco: "LeEco",
  lenovo: "Lenovo",
  lg: "LG",
  meizu: "Meizu",
  micromax: "Micromax",
  mobvoi: "Mobvoi",
  motorola: "Motorola",
  murena: "Murena",
  nextbit: "Nextbit",
  nintendo: "Nintendo",
  nokia: "Nokia",
  nothing: "Nothing",
  nubia: "Nubia",
  nvidia: "NVIDIA",
  oneplus: "OnePlus",
  oppo: "OPPO",
  osom: "OSOM",
  planetcomputers: "Planet Computers",
  qualcomm: "Qualcomm",
  radxa: "Radxa",
  razer: "Razer",
  realme: "realme",
  retroid: "Retroid",
  samsung: "Samsung",
  shift: "SHIFT",
  smartisan: "Smartisan",
  solana: "Solana",
  sony: "Sony",
  tecno: "TECNO",
  teracube: "Teracube",
  volla: "Volla",
  vsmart: "Vsmart",
  walmart: "Walmart",
  wileyfox: "Wileyfox",
  wingtech: "Wingtech",
  xiaomi: "Xiaomi",
  yandex: "Yandex",
  yu: "YU",
  zinwa: "Zinwa",
  zte: "ZTE",
};

export function vendorName(vendor: string): string {
  return (
    VENDOR_NAMES[vendor] ?? vendor.charAt(0).toUpperCase() + vendor.slice(1)
  );
}
