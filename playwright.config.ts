import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3217);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    // The tutor must work with no credentials: tests run with the key removed.
    env: { ANTHROPIC_API_KEY: "" },
  },
});
