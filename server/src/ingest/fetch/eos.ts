import { fetchText, mapLimit } from "./util.ts";

const BASE_URL = "https://doc.e.foundation/devices";
// The date the statements were read, not the build date.
const VERIFIED_AT = "2026-11-15";

interface RelockEntry {
  codename: string;
  status: "supported" | "unsupported";
  summary: string;
  sourceUrl: string;
  verifiedAt: string;
}

/**
 * The devices index lists the current roster; each device page states whether
 * its bootloader can be locked again after /e/OS is installed ("Bootloader
 * lockable" / "Bootloader not lockable"). That statement is per device, so it
 * is fetched per device.
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const page = await fetchText(BASE_URL);
    const codenames = [
      ...new Set(
        [...page.matchAll(/class=["']?chip["']?>([^<]+)</g)]
          .map((match) => match[1].trim())
          .filter(Boolean),
      ),
    ];

    const relock = await mapLimit(codenames, 6, async (codename) => {
      const sourceUrl = `${BASE_URL}/${encodeURIComponent(codename)}`;
      try {
        const html = await fetchText(sourceUrl);
        const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        if (/Bootloader not lockable/i.test(text)) {
          return {
            codename,
            status: "unsupported",
            summary:
              '/e/OS lists the bootloader as "not lockable" for this device.',
            sourceUrl,
            verifiedAt: VERIFIED_AT,
          } satisfies RelockEntry;
        }
        if (/Bootloader lockable/i.test(text)) {
          return {
            codename,
            status: "supported",
            summary:
              '/e/OS lists the bootloader as "lockable" for this device.',
            sourceUrl,
            verifiedAt: VERIFIED_AT,
          } satisfies RelockEntry;
        }
        return null;
      } catch (error) {
        console.error(
          `Failed to fetch the ${codename} device page: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    return JSON.stringify({
      page,
      relock: relock.filter((entry): entry is RelockEntry => entry !== null),
    });
  } catch (error) {
    return new Error(
      `Failed to fetch /e/OS devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
