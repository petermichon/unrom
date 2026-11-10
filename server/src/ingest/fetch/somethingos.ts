import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/SomethingOS/website_devices/main/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("SomethingOS", URL);
}
