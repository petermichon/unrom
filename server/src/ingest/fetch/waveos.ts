import { fetchSource } from "./util.ts";

// Last published roster (2021); the project is discontinued.
const URL =
  "https://raw.githubusercontent.com/Wave-Project/website-api/main/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("WaveOS", URL);
}
