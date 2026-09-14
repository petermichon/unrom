import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const SERVER_ROOT = resolve(here, "..");

export const DATA_DIR = process.env.DATA_DIR
  ? resolve(process.env.DATA_DIR)
  : resolve(SERVER_ROOT, "../data");

export const DIST_DIR = process.env.OUT_DIR
  ? resolve(process.env.OUT_DIR)
  : join(SERVER_ROOT, "dist");

export const DB_PATH = process.env.DB_PATH
  ? resolve(process.env.DB_PATH)
  : join(DIST_DIR, "unrom.sqlite");

export const JSON_PATH = join(DIST_DIR, "unrom.json");
export const NDJSON_PATH = join(DIST_DIR, "normalized.ndjson");
