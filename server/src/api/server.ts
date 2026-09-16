import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { etag } from "hono/etag";
import type { Context } from "hono";

import { createApi } from "../data/queries.ts";
import { DB_PATH, DIST_DIR } from "../paths.ts";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";

let api: ReturnType<typeof createApi>;
try {
  api = createApi(DB_PATH);
} catch {
  console.error(
    `Could not open the database at ${DB_PATH}.\n` +
      "Build it first: npm run build:data",
  );
  process.exit(1);
}

const app = new Hono();

// Read-only JSON: allow conditional requests (304) and revalidation, but never
// a stale cache. The exports are streamed attachments and are left untouched.
const revalidate = async (c: Context, next: () => Promise<void>) => {
  await next();
  if (c.res.status === 200) {
    c.res.headers.set("cache-control", "public, max-age=0, must-revalidate");
  }
};

for (const path of [
  "/api/health",
  "/api/meta",
  "/api/devices",
  "/api/devices/*",
  "/api/roms",
  "/api/roms/*",
  "/api/data",
]) {
  app.use(path, etag(), revalidate);
}

async function sendFile(
  c: Context,
  filePath: string,
  contentType: string,
  filename: string,
): Promise<Response> {
  try {
    const [body, info] = await Promise.all([
      readFile(filePath),
      stat(filePath),
    ]);
    return new Response(body, {
      headers: {
        "content-type": contentType,
        "content-length": String(info.size),
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return c.json({ error: "export not built" }, 404);
  }
}

app.get("/api", (c) =>
  c.json({
    name: "unrom api",
    endpoints: [
      "GET /api/health",
      "GET /api/meta",
      "GET /api/devices?q=",
      "GET /api/devices/:codename",
      "GET /api/roms",
      "GET /api/roms/:id",
      "GET /api/data",
      "GET /api/export/json",
      "GET /api/export/sqlite",
    ],
  }),
);

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/meta", (c) => c.json(api.getMeta()));

app.get("/api/devices", (c) =>
  c.json(api.listDevices(c.req.query("q") ?? undefined)),
);

app.get("/api/devices/:codename", (c) => {
  const codename = c.req.param("codename");
  const device = api.getDevice(codename);
  return device
    ? c.json(device)
    : c.json({ error: `device not found: ${codename}` }, 404);
});

app.get("/api/roms", (c) => c.json(api.listRoms()));

app.get("/api/roms/:id", (c) => {
  const id = c.req.param("id");
  const rom = api.getRom(id);
  return rom ? c.json(rom) : c.json({ error: `rom not found: ${id}` }, 404);
});

app.get("/api/data", (c) => c.json(api.listMappings()));

app.get("/api/export/json", (c) =>
  sendFile(
    c,
    join(DIST_DIR, "unrom.json"),
    "application/json; charset=utf-8",
    "unrom.json",
  ),
);

app.get("/api/export/sqlite", (c) =>
  sendFile(
    c,
    join(DIST_DIR, "unrom.sqlite"),
    "application/vnd.sqlite3",
    "unrom.sqlite",
  ),
);

app.notFound((c) => c.json({ error: "not found" }, 404));

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "internal error" }, 500);
});

const server = serve(
  { fetch: app.fetch, hostname: HOST, port: PORT },
  (info) => {
    console.log(
      `unrom api listening on http://${HOST}:${info.port} (db: ${DB_PATH})`,
    );
  },
);

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${PORT} is already in use. Set PORT to another value.`
      : error,
  );
  process.exit(1);
});

function shutdown() {
  server.close();
  api.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
