import { fetchTreeSnapshot } from "./util.ts";

// One build document per device at the repository root; the codename is the
// file name. The tree API keeps this to one request for the whole roster.
export function listDevices(): Promise<string | Error> {
  return fetchTreeSnapshot({
    repo: "VoltageOS/android_vendor_voltageota",
    branch: "17",
    file: /^[A-Za-z0-9_]+\.json$/,
    label: "VoltageOS",
  });
}
