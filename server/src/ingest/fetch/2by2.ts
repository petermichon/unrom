import { fetchWithTimeout as fetch } from "./util.ts";

// 2by2 keeps one roster per Android branch. The current branch lives in the
// `android_vendor_*` repo; the older `vendor_*` repo still lists devices that
// have not moved, so both are snapshotted.
const CURRENT_URL =
  "https://raw.githubusercontent.com/2by2-Project/android_vendor_2by2-ota/main/devices.json";
const LEGACY_URL =
  "https://raw.githubusercontent.com/2by2-Project/vendor_2by2-ota/main/devices.json";

async function fetchDevices(url: string): Promise<string | Error> {
  const response = await fetch(url);
  if (!response.ok) {
    return new Error(
      `Failed to fetch 2by2 Project devices: ${response.statusText}`,
    );
  }

  return await response.text();
}

export function listDevices(): Promise<string | Error> {
  return fetchDevices(CURRENT_URL);
}

export function listLegacyDevices(): Promise<string | Error> {
  return fetchDevices(LEGACY_URL);
}
