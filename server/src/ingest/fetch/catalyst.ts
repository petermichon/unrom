import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/catalyst-android/OTA/13/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("CatalystOS", URL);
}
