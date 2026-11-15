import { normalizeDate } from "../../sources/adapter.ts";
import { parseSupportedDevices } from "../../sources/grapheneos.ts";
import { fetchText, mapLimit } from "./util.ts";

const BASE_URL = "https://grapheneos.org/faq";
// One file per device and channel: `<version> <unix timestamp> <codename> <channel>`.
const RELEASE_URL = "https://releases.grapheneos.org";

interface Release {
  codename: string;
  date: string;
}

/** The first line of a stable-channel file names the newest release. */
async function latestRelease(codename: string): Promise<Release | null> {
  const text = await fetchText(
    `${RELEASE_URL}/${encodeURIComponent(codename)}-stable`,
  );
  const fields = text.trim().split(/\s+/);
  // The version is `YYYYMMDDHH`; the second field is the release timestamp.
  const date = normalizeDate(Number(fields[1]));
  return date ? { codename, date } : null;
}

export async function listDevices(): Promise<string | Error> {
  try {
    const page = await fetchText(BASE_URL);
    const devices = parseSupportedDevices(page);

    const builds = await mapLimit(devices, 6, async (device) => {
      try {
        return await latestRelease(device.codename);
      } catch (error) {
        console.error(
          `Failed to fetch the ${device.codename} release: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    return JSON.stringify({
      page,
      builds: builds.filter((build): build is Release => build !== null),
    });
  } catch (error) {
    return new Error(
      `Failed to fetch GrapheneOS devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
