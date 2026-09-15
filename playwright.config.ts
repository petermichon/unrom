import { defineConfig, devices } from "@playwright/test";

const API_URL = "http://127.0.0.1:3000";
const WEB_URL = "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: { baseURL: WEB_URL },
  webServer: [
    {
      // Build the dataset, then serve the API the SSR loaders call.
      command: "npm run build:data && npm run api",
      url: `${API_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        "npm run build --workspace web && npm run start --workspace web",
      url: WEB_URL,
      env: { API_URL, PORT: "3001" },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
