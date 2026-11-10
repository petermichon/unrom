import { fetchWithTimeout as fetch } from "./util.ts";

const AOSP_URL = "https://sourceforge.net/projects/nameless-aosp/files/";
const CLO_URL = "https://sourceforge.net/projects/nameless-clo/files/";

async function fetchPage(url: string, label: string): Promise<string | Error> {
  const response = await fetch(url);
  if (!response.ok) {
    return new Error(`Failed to fetch ${label}: ${response.statusText}`);
  }

  return await response.text();
}

export async function listAospDevices(): Promise<string | Error> {
  return fetchPage(AOSP_URL, "Nameless AOSP devices");
}

export async function listCloDevices(): Promise<string | Error> {
  return fetchPage(CLO_URL, "Nameless CLO devices");
}
