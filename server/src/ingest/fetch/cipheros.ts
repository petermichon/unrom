import { fetchSource } from "./util.ts";

// The devices page embeds its roster as an ItemList in JSON-LD.
const URL = "https://cipheros.org.in/devices";

export function listDevices(): Promise<string | Error> {
  return fetchSource("CipherOS", URL);
}
