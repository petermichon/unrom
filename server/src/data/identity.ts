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
// do not fall into the `unknown` bucket. (Confirmed against MobileModels /
// LineageOS wiki.)
const VENDOR_BY_CODENAME: Record<string, string> = {
  sapphire: "xiaomi",
};

export function vendorForCodename(codename: string): string | null {
  return VENDOR_BY_CODENAME[codename.toLowerCase()] ?? null;
}

export const UNKNOWN_VENDOR = "unknown";

// Some sources pack several codenames into one entry with "/". Where a part is
// not a device of its own, map the entry to the real codename(s) instead of
// creating a phantom device. Anything unlisted is split on "/".
const COMBINED_CODENAMES: Record<string, string[]> = {
  "ginkgo/willow": ["ginkgo"],
  "haydnin/haydn": ["haydn"],
  "mojito/sunny": ["mojito", "sunny"],
  "raphael/in": ["raphael"],
  "sapphire/sapphiren": ["sapphire"],
  "vayu/bhima": ["vayu"],
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

// Within a vendor, some sources use the un-disambiguated codename for a device
// the vendor names differently (LineageOS uses `xmsirius` for the Xiaomi Mi 8 SE
// because `sirius` is Sony's Xperia Z2). Map `(vendor, codename)` → canonical.
const VENDOR_CODENAME_ALIASES: Record<string, string> = {
  "xiaomi\0sirius": "xmsirius",
};

export function canonicalCodename(vendor: string, codename: string): string {
  return VENDOR_CODENAME_ALIASES[`${vendor}\0${codename}`] ?? codename;
}
