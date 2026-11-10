import { fetchWithTimeout as fetch } from "./util.ts";

// The download page is a Next.js app that embeds the current roster in
// `__NEXT_DATA__`; the GitHub roster stopped in 2022, so the site is the live
// source. The whole page is snapshotted and the parser extracts the JSON.
const BASE_URL = "https://spark-os.tech/download";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch SparkOS devices: ${response.statusText}`);
  }

  return await response.text();
}
