import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.SITE_AUDIT_PORT ?? 3399);

/** Audits the production build (run `bun run build` first). */
export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.mts",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, ...devices["Desktop Chrome"] },
  webServer: {
    command: `bunx docusaurus serve --port ${port} --host 127.0.0.1 --no-open`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
