import { fetchTreeSnapshot } from "./util.ts";

// One build document per device under builds/; the codename is the file name.
// Some documents are malformed JSON (`stone` repeats the object, `sweet` has a
// leading-zero datetime), so the raw text is kept and the parser reads fields.
export function listDevices(): Promise<string | Error> {
  return fetchTreeSnapshot({
    repo: "Black-Iron-Project/OTA",
    branch: "z16",
    file: /^builds\/[^/]+\.json$/,
    label: "Black Iron Project",
    json: false,
  });
}
