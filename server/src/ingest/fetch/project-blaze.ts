import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/ProjectBlaze/official_devices/14/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("Project Blaze", URL);
}
