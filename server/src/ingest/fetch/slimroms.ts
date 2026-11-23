import { fetchSource } from "./util.ts";

// Last published roster (2017); the project is discontinued.
const URL =
  "https://raw.githubusercontent.com/slimroms/slimroms.github.io/master/data/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("SlimRoms", URL);
}
