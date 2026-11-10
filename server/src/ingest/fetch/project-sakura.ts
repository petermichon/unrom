import { fetchWithTimeout as fetch } from "./util.ts";

const BASE_URL =
  "https://raw.githubusercontent.com/ProjectSakura/OTA/16/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Project Sakura devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
