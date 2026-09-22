// Canonical device names. The ROM rosters are treated as codename-only; names
// come from here, with a normalized fallback for codenames not yet curated.
//
// Keyed `vendor\0codename` (a codename is only unique per vendor). A codename
// can name several models (e.g. `sweet` is both the Pro and the Pro Max), so
// the value is a list; the first is the compact display name. Keep entries
// alphabetical by codename within a vendor.
export const DEVICE_NAMES: Record<string, string[]> = {
  "brax\0brax3": ["Brax3"],

  "gigaset\0GS290": ["Gigaset GS290"],
  "gigaset\0GS6_Venus": ["Gigaset GS6", "Gigaset GS6 Pro"],

  "murena\0one": ["Murena One"],
  "murena\0two": ["Murena Two"],

  "oneplus\0ziti": ["OnePlus Nord CE 3 5G"],

  "samsung\0f62": ["Galaxy F62"],
  "samsung\0m62": ["Galaxy M62"],

  "teracube\0emerald": ["Teracube 2e (2021)"],
  "teracube\0zirconia": ["Teracube 2e (2020)"],

  "volla\0mimir": ["Volla Tablet"],

  "xiaomi\0alioth": ["POCO F3", "Xiaomi Mi 11X", "Redmi K40"],
  "xiaomi\0aliothin": ["POCO F3 (India)"],
  "xiaomi\0annibale": ["Redmi K90", "POCO F8 Pro"],
  "xiaomi\0bhima": ["POCO X3 Pro (India)"],
  "xiaomi\0citrus": ["POCO M3"],
  "xiaomi\0courbet": ["Xiaomi 11 Lite 4G"],
  "xiaomi\0courbetin": ["Xiaomi 11 Lite 4G (India)"],
  "xiaomi\0curtana": ["Redmi Note 9S"],
  "xiaomi\0davinci": ["Xiaomi Mi 9T", "Redmi K20"],
  "xiaomi\0davinciin": ["Redmi K20 (India)"],
  "xiaomi\0elish": ["Xiaomi Pad 5 Pro"],
  "xiaomi\0excalibur": ["Redmi Note 9 Pro Max"],
  "xiaomi\0ginkgo": ["Redmi Note 8"],
  "xiaomi\0gram": ["POCO M2 Pro"],
  "xiaomi\0haydn": ["Xiaomi Mi 11i", "Mi 11X Pro", "Redmi K40 Pro+"],
  "xiaomi\0haydnin": ["Mi 11X Pro (India)"],
  "xiaomi\0joyeuse": ["Redmi Note 9 Pro"],
  "xiaomi\0karna": ["POCO X3 (India)"],
  "xiaomi\0lemon": ["Redmi 9 Prime"],
  "xiaomi\0lime": ["Redmi 9T", "Redmi 9 Power", "Redmi 9T NFC"],
  "xiaomi\0marble": ["POCO F5", "Redmi Note 12 Turbo"],
  "xiaomi\0marblein": ["POCO F5 (India)"],
  "xiaomi\0miatoll": ["Redmi Note 9S", "Redmi Note 9 Pro", "POCO M2 Pro"],
  "xiaomi\0mojito": ["Redmi Note 10"],
  "xiaomi\0phoenix": ["POCO X2", "Redmi K30"],
  "xiaomi\0phoenixin": ["POCO X2 (India)"],
  "xiaomi\0pomelo": ["Redmi 9 Power (India)"],
  "xiaomi\0sky": ["Redmi 12 5G", "POCO M6 Pro 5G"],
  "xiaomi\0skyin": ["Redmi 12 5G (India)"],
  "xiaomi\0sunny": ["Redmi Note 10 (India)"],
  "xiaomi\0surya": ["POCO X3 NFC"],
  "xiaomi\0sweet": ["Redmi Note 10 Pro", "Redmi Note 10 Pro Max"],
  "xiaomi\0sweetin": ["Redmi Note 10 Pro (India)"],
  "xiaomi\0vayu": ["POCO X3 Pro"],
  "xiaomi\0willow": ["Redmi Note 8T"],
};

/** Canonical names for a device, or null when it is not curated yet. */
export function deviceNames(
  vendor: string,
  codename: string,
): string[] | null {
  return DEVICE_NAMES[`${vendor}\0${codename}`] ?? null;
}
