import { fetchSource } from "./util.ts";

// Last published roster (2021); the project is discontinued.
const URL =
  "https://raw.githubusercontent.com/Zeus-OS/website_data/main/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("ZeusOS", URL);
}
