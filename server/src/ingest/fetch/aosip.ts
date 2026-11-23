import { fetchSource } from "./util.ts";

// Last published roster (2021); the project is discontinued.
const URL = "https://raw.githubusercontent.com/AOSiP/api/master/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("AOSiP", URL);
}
