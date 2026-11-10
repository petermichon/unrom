import { fetchWithTimeout as fetch } from "./util.ts";

const BASE_URL = "https://download.lineage.microg.org/";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch LineageOS for microG devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
