#!/usr/bin/env node
/**
 * Start the API and the web app on their fixed loopback ports.
 *
 *   npm run dev
 *
 * The ports are private upstreams for the host-routing dev proxy
 * (`http://unrom.localhost:7357`), so they never appear in a URL. Point the
 * proxy's `proxy.json` at them; override with WEB_PORT / API_PORT.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_PORT = Number(process.env.WEB_PORT ?? 5200);
const API_PORT = Number(process.env.API_PORT ?? 5201);

function canConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(250);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function isBusy(port: number): Promise<boolean> {
  return Promise.all([
    canConnect("127.0.0.1", port),
    canConnect("::1", port),
  ]).then(([ipv4, ipv6]) => ipv4 || ipv6);
}

async function waitFor(port: number, label: string): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await isBusy(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${label} on ${port} did not start within 30s.`);
}

async function main(): Promise<void> {
  for (const [label, port, variable] of [
    ["web", WEB_PORT, "WEB_PORT"],
    ["API", API_PORT, "API_PORT"],
  ] as const) {
    if (await isBusy(port)) {
      throw new Error(
        `Port ${port} is already in use. Stop that process or set ${variable}.`,
      );
    }
  }

  console.log(`[dev] web http://localhost:${WEB_PORT}`);
  console.log(`[dev] api http://127.0.0.1:${API_PORT}`);

  const children: ReturnType<typeof spawn>[] = [];

  const start = (args: string[], env: Record<string, string>) => {
    const child = spawn("npm", args, {
      cwd: ROOT,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    children.push(child);
    return child;
  };

  let exiting = false;
  const shutdown = (code: number) => {
    if (exiting) return;
    exiting = true;
    for (const child of children) child.kill("SIGTERM");
    process.exit(code);
  };

  process.on("SIGINT", () => shutdown(130));
  process.on("SIGTERM", () => shutdown(143));
  process.on("SIGHUP", () => shutdown(129));

  const api = start(["run", "dev", "--workspace", "server"], {
    PORT: String(API_PORT),
  });
  await waitFor(API_PORT, "The API");

  const web = start(
    [
      "run",
      "dev",
      "--workspace",
      "web",
      "--",
      "--port",
      String(WEB_PORT),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    { API_URL: `http://127.0.0.1:${API_PORT}` },
  );
  await waitFor(WEB_PORT, "The dev server");

  for (const child of [api, web]) {
    child.on("exit", (code) => shutdown(code ?? 1));
  }
}

main().catch((error: unknown) => {
  console.error(`[dev] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
