import { fetchWithTimeout as fetch } from "./util.ts";

const BASE_URL =
  "https://raw.githubusercontent.com/The-Clover-Project/TheCloverProject.com/main/data/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Clover devices: ${response.status} ${response.statusText}`.trim(),
    );
  }

  return await response.text();
}
