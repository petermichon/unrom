import { fetchTreeSnapshot } from "./util.ts";

// Per-device roster file: <codename>/<codename>.json. The sibling cert.json
// files do not match the backreference, so they never enter the snapshot.
export function listDevices(): Promise<string | Error> {
  return fetchTreeSnapshot({
    repo: "yaap/device-info",
    branch: "master",
    file: /^([^/]+)\/\1\.json$/,
    label: "YAAP",
  });
}
