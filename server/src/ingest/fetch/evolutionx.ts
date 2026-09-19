import { fetchJson, fetchText, mapLimit } from "./util.ts";

const REPO = "Evolution-X/OTA";
// One branch per release line. A codename keeps the record from the newest
// branch that has it; `cnb`/`bka` are Android 16 lines, `vic` Android 15,
// `udc` Android 14. The `*-vanilla` branches hold the same codenames (GMS-free
// builds) so they add no devices.
const BRANCHES = ["cnb", "bka", "vic", "udc"];

// The project's published roster (drives evolution-x.org/devices). Used only as
// a drift check — it can lag the OTA repo.
const ROSTER_URL =
  "https://raw.githubusercontent.com/Evolution-X/www_gitres/main/devices/devices.json";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
  html_url: string;
}

interface BuildFile {
  response?: Array<Record<string, unknown>>;
}

async function rosterCodenames(): Promise<Set<string> | null> {
  try {
    const roster = await fetchJson<Array<{ codename?: unknown }>>(ROSTER_URL);
    return new Set(
      roster
        .map((entry) => entry?.codename)
        .filter((code): code is string => typeof code === "string"),
    );
  } catch (error) {
    console.error(
      `Failed to read Evolution X roster: ${
        error instanceof Error ? error.message : error
      }`,
    );
    return null;
  }
}

/**
 * Each device has its own build JSON under `builds/` on each release branch. We
 * list every branch once, keep the newest branch per codename, then download it
 * from its raw URL, tagging the codename from the file name (the JSON itself
 * does not include it) and the branch as provenance.
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const byCodename = new Map<
      string,
      { rawUrl: string; sourceUrl: string; branch: string }
    >();

    for (const ref of BRANCHES) {
      let files: GitHubFile[];
      try {
        files = await fetchJson<GitHubFile[]>(
          `https://api.github.com/repos/${REPO}/contents/builds?ref=${ref}`,
        );
      } catch (error) {
        console.error(
          `Failed to list ${ref}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        continue;
      }

      for (const file of files) {
        if (file.type !== "file" || !file.name.endsWith(".json")) continue;
        if (!file.download_url) continue;
        const codename = file.name.replace(/\.json$/, "");
        if (byCodename.has(codename)) continue;
        byCodename.set(codename, {
          rawUrl: file.download_url,
          sourceUrl: file.html_url,
          branch: ref,
        });
      }
    }

    const devices = [...byCodename.entries()];
    const builds = await mapLimit(devices, 8, async ([codename, file]) => {
      try {
        const data = JSON.parse(await fetchText(file.rawUrl)) as BuildFile;
        const latest = data.response?.[0];
        if (!latest) return null;
        return {
          ...latest,
          codename,
          sourceUrl: file.sourceUrl,
          sourceBranch: file.branch,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${codename}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    const roster = await rosterCodenames();
    if (roster) {
      const missingFromOta = [...roster].filter(
        (code) => !byCodename.has(code),
      );
      const notInRoster = [...byCodename.keys()].filter(
        (code) => !roster.has(code),
      );
      console.log(
        `Evolution X: ${byCodename.size} device(s) across ${BRANCHES.join(", ")}; ` +
          `roster diff: ${missingFromOta.length} roster-only, ${notInRoster.length} OTA-only` +
          (missingFromOta.length
            ? ` (roster-only: ${missingFromOta.join(", ")})`
            : "") +
          (notInRoster.length ? ` (OTA-only: ${notInRoster.join(", ")})` : ""),
      );
    }

    return JSON.stringify(builds.filter((build) => build !== null));
  } catch (error) {
    return new Error(
      `Failed to fetch Evolution X devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
