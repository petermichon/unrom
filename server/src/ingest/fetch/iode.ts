import { fetchWithTimeout as fetch } from "./util.ts";

const TREE_URL =
  "https://gitlab.iode.tech/api/v4/projects/ota%2Frelease/repository/tree?recursive=true";
const SUPPORTED_URL = "https://iode.tech/iodeos-official-supported-devices/";

async function fetchText(url: string, label: string): Promise<string | Error> {
  const response = await fetch(url);
  if (!response.ok) {
    return new Error(`Failed to fetch ${label}: ${response.statusText}`);
  }

  return await response.text();
}

export async function listDevices(): Promise<string | Error> {
  return fetchText(TREE_URL, "iodéOS devices");
}

export async function listSupportedDevices(): Promise<string | Error> {
  return fetchText(SUPPORTED_URL, "iodéOS supported devices");
}
