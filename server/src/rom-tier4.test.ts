import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCarbonRom } from "./sources/carbon.ts";
import { parseCipheros } from "./sources/cipheros.ts";
import { parseVoltageOS } from "./sources/voltageos.ts";

// Tier 4 rosters live on the projects' own sites. Each parser is pinned against
// a small excerpt of the markup or payload it reads, so an upstream redesign
// fails here instead of silently emptying the roster.

test("Carbon ROM reads the device table and keeps the newest build date", () => {
  const row = (codename: string, name: string, date: string) => `
    <tr>
      <td><a href="/device-${codename}.html" title="Click to show all roms for ${codename}"> ${codename}</a><br><small>${name}</small></td>
      <td>weekly</td>
      <td><a href="https://mirrorbits.carbonrom.org/${codename}/build.zip">build.zip</a></td>
      <td>679.59 MB</td>
      <td>${date}</td>
    </tr>`;

  const records = parseCarbonRom(
    `<table><tbody>
      ${row("sweet", "Xiaomi Redmi Note 10 Pro", "Thu, 29 Oct 2026 00:13:18 GMT")}
      ${row("sweet", "Xiaomi Redmi Note 10 Pro", "Thu, 01 Oct 2026 00:13:18 GMT")}
      ${row("whyred", "Xiaomi Redmi Note 5 / 5 Pro", "Tue, 06 Oct 2026 10:00:00 GMT")}
    </tbody></table>`,
  );

  assert.deepEqual(
    records.map((record) => [record.codename, record.name]),
    [
      ["sweet", "Xiaomi Redmi Note 10 Pro"],
      ["whyred", "Xiaomi Redmi Note 5 / 5 Pro"],
    ],
  );
  assert.equal(records[0]?.buildDate, "2026-10-29");
  assert.equal(
    records[0]?.referenceUrl,
    "https://get.carbonrom.org/device-sweet.html",
  );
});

test("CipherOS reads its JSON-LD ItemList and drops the codename suffix", () => {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: 2,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "realme C11/12/15 (RMX2185)",
        url: "https://cipheros.org.in/devices/RMX2185",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cipher Single System Image (cssi)",
        url: "https://cipheros.org.in/devices/cssi",
      },
    ],
  };

  const records = parseCipheros(
    `<html><script type="application/ld+json">${JSON.stringify(list)}</script></html>`,
  );

  assert.deepEqual(
    records.map((record) => [record.codename, record.name]),
    [
      ["RMX2185", "realme C11/12/15"],
      ["cssi", "Cipher Single System Image"],
    ],
  );
  assert.equal(
    records[1]?.referenceUrl,
    "https://cipheros.org.in/devices/cssi",
  );
});

test("VoltageOS takes the newest build from each device document", () => {
  const snapshot = {
    files: [
      {
        path: "marble.json",
        device: {
          response: [
            {
              device: "POCO F5",
              oem: "Xiaomi",
              timestamp: 1789746862,
            },
            {
              device: "POCO F5 (newer)",
              oem: "Xiaomi",
              timestamp: 1799746862,
            },
          ],
        },
      },
      { path: "empty.json", device: { response: [] } },
    ],
  };

  const records = parseVoltageOS(JSON.stringify(snapshot));

  assert.equal(records.length, 1);
  assert.equal(records[0]?.codename, "marble");
  assert.equal(records[0]?.name, "POCO F5 (newer)");
  assert.equal(records[0]?.brand, "Xiaomi");
  assert.equal(records[0]?.buildDate, "2027-01-12");
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/VoltageOS/android_vendor_voltageota/blob/17/marble.json",
  );
});
