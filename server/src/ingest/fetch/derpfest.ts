import { fetchJson } from "./util.ts";

// The project's own device index, regenerated from `DerpFest-AOSP/Updater-Stuff`
// plus maintainer overrides. It carries display names, aliases and the latest
// build per device (the OTA repo itself is stale for many devices).
const INDEX_URL = "https://derpfest.org/devices-index.json";

// Derive a per-device SourceForge folder from a build's file URL, e.g.
// `…/projects/derpfest/files/vayu/DerpFest-…zip/download` -> `…/files/vayu/`.
const SOURCEFORGE_FOLDER =
  /^(https:\/\/sourceforge\.net\/projects\/[^/]+\/files\/.*\/)[^/]+\.zip\/download$/i;

interface DerpIndex {
  devices?: unknown;
}

interface DerpDevice {
  codename?: unknown;
  latest?: { url?: unknown } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function listDevices(): Promise<string | Error> {
  try {
    const index = await fetchJson<DerpIndex>(INDEX_URL);
    const list = Array.isArray(index.devices) ? index.devices : [];

    const devices = list
      .filter(isRecord)
      .map((device) => {
        const latest = (device.latest ?? {}) as { url?: unknown };
        const url = typeof latest.url === "string" ? latest.url : "";
        const folder = SOURCEFORGE_FOLDER.exec(url);
        return {
          ...device,
          reference: folder ? folder[1] : INDEX_URL,
        };
      })
      .filter((device) => {
        const { codename, latest } = device as DerpDevice;
        const url = latest && typeof latest === "object" ? latest.url : null;
        return (
          typeof codename === "string" &&
          codename !== "device-info" &&
          typeof url === "string" &&
          url !== ""
        );
      });

    return JSON.stringify(devices);
  } catch (error) {
    return new Error(
      `Failed to fetch DerpFest devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
