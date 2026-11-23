import { fetchSource } from "./util.ts";

// Last published roster (2021); the project has not shipped since.
const URL =
  "https://raw.githubusercontent.com/ReloadedOS/official_devices/master/device.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("ReloadedOS", URL);
}
