import { fetchWithTimeout as fetch } from "./util.ts";

const URL = "https://storage.googleapis.com/play_public/supported_devices.csv";

/**
 * Google's list of Play-certified devices. The download is UTF-16LE with a BOM;
 * decode it before writing the UTF-8 snapshot to `data/`.
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`${URL}: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return new TextDecoder("utf-16le").decode(buffer).replace(/^\uFEFF/, "");
  } catch (error) {
    return new Error(
      `Failed to fetch Play devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
