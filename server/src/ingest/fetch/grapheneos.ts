import { normalizeDate } from "../../sources/adapter.ts";
import { parseSupportedDevices } from "../../sources/grapheneos.ts";
import { fetchText, mapLimit } from "./util.ts";

const BASE_URL = "https://grapheneos.org/faq";
// One file per device and channel: `<version> <unix timestamp> <codename> <channel>`.
const RELEASE_URL = "https://releases.grapheneos.org";
// The changelog names the Android security patch level of each release.
const RELEASES_URL = "https://grapheneos.org/releases";

interface Release {
  codename: string;
  version: string;
  date: string;
}

/** The first line of a stable-channel file names the newest release. */
async function latestRelease(codename: string): Promise<Release | null> {
  const text = await fetchText(
    `${RELEASE_URL}/${encodeURIComponent(codename)}-stable`,
  );
  const fields = text.trim().split(/\s+/);
  // The version is `YYYYMMDDHH`; the second field is the release timestamp.
  const version = fields[0];
  const date = normalizeDate(Number(fields[1]));
  if (!date || !/^\d{10}$/.test(version ?? "")) return null;
  return { codename, version, date };
}

export async function listDevices(): Promise<string | Error> {
  try {
    const page = await fetchText(BASE_URL);
    const devices = parseSupportedDevices(page);

    // The changelog is large and only enriches the builds, so a failed fetch
    // leaves the patch level unknown instead of failing the whole source.
    let releases: string | null = null;
    try {
      releases = await fetchText(RELEASES_URL);
    } catch (error) {
      console.error(
        `Failed to fetch the GrapheneOS release notes: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }

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
      releases,
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
