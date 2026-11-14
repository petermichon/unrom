import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import type { Context } from "hono";

import { createApi } from "../data/queries.ts";
import { DB_PATH, DIST_DIR } from "../paths.ts";
import { openapi } from "./openapi.ts";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";

// The device list is large (the catalogue plus every ROM-covered device), so a
// request without paging gets a bounded first page. Bulk consumers ask for the
// full filtered list explicitly with `all=true`.
const DEFAULT_DEVICE_LIMIT = 100;

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

// The API is read-only and public, so any origin may read it. This lives here
// rather than in the reverse proxy so self-hosters get the same behaviour
// whether or not they run Caddy in front.
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "HEAD", "OPTIONS"],
    exposeHeaders: [
      "ETag",
      "Last-Modified",
      "Content-Disposition",
      "Content-Length",
      "X-Total-Count",
    ],
    maxAge: 86400,
  }),
);

// The dataset only changes on redeploy, so serve a short fresh window and then
// let clients reuse the cached copy while revalidating in the background. This
// keeps repeat requests off the origin without letting clients drift far from
// current. Exports are streamed attachments and are left untouched.
const generatedAt = Date.parse(api.getMeta().generatedAt);
const lastModified = Number.isNaN(generatedAt)
  ? null
  : new Date(generatedAt).toUTCString();

const revalidate = async (c: Context, next: () => Promise<void>) => {
  await next();
  if (c.res.status === 200) {
    c.res.headers.set(
      "cache-control",
      "public, max-age=300, stale-while-revalidate=3600",
    );
    if (lastModified) c.res.headers.set("last-modified", lastModified);
  }
};

for (const path of [
  "/api/meta",
  "/api/summary",
  "/api/brands",
  "/api/search",
  "/api/devices",
  "/api/devices/*",
  "/api/bootloader-policies",
  "/api/bootloader-policies/*",
  "/api/registry",
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
      "GET /api/openapi.json",
      "GET /api/meta",
      "GET /api/summary",
      "GET /api/devices?q=&vendor=&letter=&limit=&offset=&all=",
      "GET /api/devices/letters",
      "GET /api/brands",
      "GET /api/bootloader-policies",
      "GET /api/bootloader-policies/:vendor",
      "GET /api/devices/:vendor/:codename",
      "GET /api/search?q=",
      "GET /api/registry?q=&vendor=",
      "GET /api/roms",
      "GET /api/roms/summary",
      "GET /api/roms/:id",
      "GET /api/data",
      "GET /api/export/json",
      "GET /api/export/sqlite",
    ],
  }),
);

// Keep the index reachable with a trailing slash without duplicating the list.
app.get("/api/", (c) => c.redirect("/api", 308));

app.get("/api/health", (c) => {
  c.header("cache-control", "no-store");
  return c.json({ ok: true });
});

app.get("/api/openapi.json", (c) => {
  c.header("cache-control", "public, max-age=3600");
  return c.json(openapi);
});

app.get("/api/meta", (c) => c.json(api.getMeta()));

app.get("/api/summary", (c) => c.json(api.getSummary()));

app.get("/api/devices/letters", (c) => c.json(api.letterCounts()));

app.get("/api/brands", (c) => c.json(api.listBrands()));

app.get("/api/bootloader-policies", (c) =>
  c.json(api.listBootloaderPolicies()),
);

app.get("/api/bootloader-policies/:vendor", (c) => {
  const vendor = c.req.param("vendor");
  const policy = api.getBootloaderPolicy(vendor);
  return policy
    ? c.json(policy)
    : c.json({ error: `bootloader policy not found: ${vendor}` }, 404);
});

app.get("/api/search", (c) => c.json(api.search(c.req.query("q") ?? "")));

app.get("/api/devices", (c) => {
  const query = c.req.query("q") ?? undefined;
  const vendor = c.req.query("vendor") ?? undefined;
  const letter = c.req.query("letter")?.toUpperCase();
  if (letter && !/^(?:[A-Z#]|OTHER)$/.test(letter)) {
    return c.json({ error: `invalid letter: ${letter}` }, 400);
  }

  const parse = (name: string): number | undefined => {
    const raw = c.req.query(name);
    if (raw === undefined) return undefined;
    const value = Number(raw);
    return Number.isInteger(value) ? value : Number.NaN;
  };
  const all = c.req.query("all");
  const hasRomsRaw = c.req.query("hasRoms");
  if (
    hasRomsRaw !== undefined &&
    hasRomsRaw !== "true" &&
    hasRomsRaw !== "false"
  ) {
    return c.json({ error: `invalid hasRoms: ${hasRomsRaw}` }, 400);
  }
  const sortRaw = c.req.query("sort");
  if (
    sortRaw !== undefined &&
    sortRaw !== "name" &&
    sortRaw !== "coverage" &&
    sortRaw !== "roms"
  ) {
    return c.json({ error: `invalid sort: ${sortRaw}` }, 400);
  }
  const limit = parse("limit");
  const offset = parse("offset");
  if (all !== undefined && all !== "true") {
    return c.json({ error: `invalid all: ${all}` }, 400);
  }
  if (all === "true" && limit !== undefined) {
    return c.json({ error: "all cannot be combined with limit" }, 400);
  }
  if (
    Number.isNaN(limit) ||
    Number.isNaN(offset) ||
    (limit !== undefined && (limit < 1 || limit > 200)) ||
    (offset !== undefined && offset < 0)
  ) {
    return c.json({ error: "invalid pagination" }, 400);
  }

  const options = {
    query,
    vendor,
    letter,
    hasRoms: hasRomsRaw === undefined ? undefined : hasRomsRaw === "true",
    sort: sortRaw as "name" | "coverage" | "roms" | undefined,
    limit: all === "true" ? undefined : (limit ?? DEFAULT_DEVICE_LIMIT),
    offset,
  };
  c.header("x-total-count", String(api.countDevices(options)));
  return c.json(api.listDevicesPage(options));
});

app.get("/api/devices/:vendor/:codename", (c) => {
  const vendor = c.req.param("vendor");
  const codename = c.req.param("codename");
  const device = api.getDevice(vendor, codename);
  return device
    ? c.json(device)
    : c.json({ error: `device not found: ${vendor}/${codename}` }, 404);
});

app.get("/api/registry", (c) =>
  c.json(
    api.listRegistry(
      c.req.query("q") ?? undefined,
      c.req.query("vendor") ?? undefined,
    ),
  ),
);

app.get("/api/roms", (c) => c.json(api.listRoms()));

// Lightweight counts for pickers; keeps `/api/roms` for the full device lists.
app.get("/api/roms/summary", (c) => c.json(api.listRomSummaries()));

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
