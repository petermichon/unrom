import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/lighthouse-os/official_devices/sailboat/official_devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("Project Lighthouse", URL);
}
