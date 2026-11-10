import { defineConfig, devices } from "@playwright/test";

import { API_PORT, API_URL, WEB_PORT, WEB_URL } from "./e2e/env.ts";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: { baseURL: WEB_URL },
  // Dedicated ports, always rebuilt: a dev server or a stale dataset must not
  // decide what the suite is testing.
  webServer: [
    {
      // Build the dataset, then serve the API the SSR loaders call.
      command: "npm run build:data && npm run api",
      url: `${API_URL}/api/health`,
      env: { PORT: API_PORT, HOST: "127.0.0.1" },
      timeout: 120_000,
    },
    {
      command: "npm run build --workspace web && npm run start --workspace web",
      url: WEB_URL,
      env: { API_URL, PORT: WEB_PORT, HOST: "127.0.0.1" },
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
