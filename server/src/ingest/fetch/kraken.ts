import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/AOSPK/official_devices/master/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("The Kraken Project", URL);
}
