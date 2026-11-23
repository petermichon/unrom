import { fetchSource } from "./util.ts";

// The mirror index lists every published build, one row per device build.
const URL = "https://get.carbonrom.org/";

export function listDevices(): Promise<string | Error> {
  return fetchSource("Carbon ROM", URL);
}
