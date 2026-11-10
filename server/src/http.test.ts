import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { fetchWithTimeout } from "./ingest/fetch/util.ts";

async function withServer(
  handler: Parameters<typeof createServer>[1],
  run: (url: string) => Promise<void>,
): Promise<void> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}/`);
  } finally {
    server.closeAllConnections();
    server.close();
  }
}

test("fetchWithTimeout aborts a stalled request", async () => {
  await withServer(
    () => {
      // Never write a response.
    },
    async (url) => {
      await assert.rejects(fetchWithTimeout(url, {}, 50));
    },
  );
});

test("fetchWithTimeout identifies the ingest client", async () => {
  await withServer(
    (request, response) => {
      response.end(request.headers["user-agent"] ?? "");
    },
    async (url) => {
      const response = await fetchWithTimeout(url);
      assert.match(await response.text(), /^unrom-ingest\//);
    },
  );
});
