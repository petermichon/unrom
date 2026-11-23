import { fetchSource } from "./util.ts";

// Last published roster (2020); the project is discontinued.
const URL =
  "https://raw.githubusercontent.com/AIMROM/aimrom.github.io/master/json/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("AIM ROM", URL);
}
