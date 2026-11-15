import assert from "node:assert/strict";
import { test } from "node:test";

import { parseEos, parseEosHtml } from "./sources/eos.ts";

test("/e/OS parses the official devices table", () => {
  const records = parseEosHtml(`
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Xiaomi</td>
  <td class=has-tooltip data-label=Name><a href=monet/>Mi 10 Lite 5G</a><div class=name-meta><span class=chip>monet</span></div></td>
</tr>
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Google</td>
  <td data-label=Name><a href=oriole/>Pixel 6</a><span class=chip>oriole</span></td>
</tr>
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Google</td>
  <td data-label=Name><a href=oriole/>Pixel 6 duplicate</a><span class=chip>oriole</span></td>
</tr>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["monet", "oriole"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    ["Mi 10 Lite 5G", "Pixel 6"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["Xiaomi", "Google"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://doc.e.foundation/devices/monet",
  );
});

test("/e/OS attaches each device page's relock statement", () => {
  const page = `
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Fairphone</td>
  <td data-label=Name><a href=FP3/>Fairphone 3</a><span class=chip>FP3</span></td>
</tr>
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Google</td>
  <td data-label=Name><a href=cheetah/>Pixel 7 Pro</a><span class=chip>cheetah</span></td>
</tr>`;

  const records = parseEos(
    JSON.stringify({
      page,
      relock: [
        {
          codename: "FP3",
          status: "supported",
          summary: 'lists the bootloader as "lockable"',
          sourceUrl: "https://doc.e.foundation/devices/FP3",
          verifiedAt: "2026-11-15",
        },
        {
          codename: "cheetah",
          status: "unsupported",
          summary: 'lists the bootloader as "not lockable"',
          sourceUrl: "https://doc.e.foundation/devices/cheetah",
          verifiedAt: "2026-11-15",
        },
      ],
    }),
  );

  const line = (codename: string) =>
    records.find((record) => record.codename === codename);
  assert.equal(line("FP3")?.relock?.status, "supported");
  assert.equal(line("cheetah")?.relock?.status, "unsupported");
  assert.equal(
    line("cheetah")?.relock?.sourceUrl,
    "https://doc.e.foundation/devices/cheetah",
  );
});
