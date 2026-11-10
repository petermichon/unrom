import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/Project-PixelStar/official_devices/15/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("PixelStar", URL);
}
