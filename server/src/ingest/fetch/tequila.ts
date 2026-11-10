import { fetchSource } from "./util.ts";

const URL =
  "https://raw.githubusercontent.com/tequilaOS/tequila_ota/main/devices.json";

export function listDevices(): Promise<string | Error> {
  return fetchSource("Tequila OS", URL);
}
