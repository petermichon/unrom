import { fetchSource } from "./util.ts";

// Last published roster (2020); the repository keeps it on its own branch.
const URL =
  "https://raw.githubusercontent.com/FreakyOS/ota_config/still_alive/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("Freaky OS", URL);
}
