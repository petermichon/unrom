import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/Palladium-OS/official_devices/12.1/devices/official_devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("PalladiumOS", URL);
}
