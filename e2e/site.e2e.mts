/// <reference types="bun" />
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const pages = [
  "/",
  "/install",
  "/privacy",
  "/docs",
  "/docs/getting-started",
  "/docs/concepts",
  "/docs/concepts/openspec",
  "/docs/concepts/tie-md-model",
  "/docs/concepts/glossary",
  "/docs/configuration",
  "/blog",
];
const wcag = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function axe(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(wcag).analyze();
  return result.violations.map(
    (violation) =>
      `${violation.id} (${violation.nodes.length}): ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(" "))
        .join(" | ")}`,
  );
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`WCAG 2.2 AA · ${colorScheme}`, () => {
    test.use({ colorScheme });
    for (const path of pages) {
      test(`${path} has no axe violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          colorScheme,
        );
        expect(await axe(page)).toEqual([]);
      });
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the landing page explains the product and its platforms", async ({
    page,
  }) => {
    await page.goto("/");
    const text = await page.locator("main").innerText();
    for (const claim of [/OpenSpec/, /local/i, /Windows/, /macOS/, /Linux/])
      expect(text).toMatch(claim);
  });

  test("the install page shows every install command", async ({ page }) => {
    await page.goto("/install");
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/curl -fsSL https:\/\/tie\.md\/install\.sh/);
    expect(text).toMatch(/irm https:\/\/tie\.md\/install\.ps1/);
    expect(text).toMatch(/npm (install|i) (-g|--global) @tie-md\/cli/);
  });
});

test.describe("privacy and consent", () => {
  const thirdParty = (page: Page) => {
    const hosts = new Set<string>();
    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "127.0.0.1") hosts.add(host);
    });
    return hosts;
  };

  test("nothing third-party loads before consent, or after declining", async ({
    page,
  }) => {
    const hosts = thirdParty(page);
    for (const path of pages)
      await page.goto(path, { waitUntil: "networkidle" });
    expect([...hosts]).toEqual([]);

    const banner = page.getByRole("region", { name: "Analytics consent" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Decline" }).click();
    await expect(banner).toBeHidden();
    await page.reload({ waitUntil: "networkidle" });
    await expect(banner).toBeHidden();
    expect([...hosts]).toEqual([]);
  });

  test("accepting loads analytics, and the privacy page can withdraw it", async ({
    page,
  }) => {
    const requested: string[] = [];
    await page.route(/googletagmanager|hs-scripts/u, (route) => {
      requested.push(new URL(route.request().url()).hostname);
      return route.fulfill({ body: "", contentType: "text/javascript" });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect
      .poll(() => requested.sort())
      .toEqual(["js.hs-scripts.com", "www.googletagmanager.com"]);

    await page.goto("/privacy");
    await expect(page.getByRole("status")).toHaveText(/allowed/);
    await page.getByRole("button", { name: "Decline analytics" }).click();
    await expect(page.getByRole("status")).toHaveText(/declined/);
  });
});

test.describe("compact viewport", () => {
  test.use({ viewport: { width: 320, height: 720 } });
  for (const path of pages) {
    test(`${path} does not scroll sideways at 320px`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test("keyboard: skip link, visible focus, and a reachable install call to action", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to main content/i });
  await expect(skip).toBeFocused();

  let reached = false;
  for (let index = 0; index < 40 && !reached; index++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element) return { text: "", outline: "none", shadow: "none" };
      const style = getComputedStyle(element);
      return {
        text: element.textContent ?? "",
        outline: style.outlineStyle,
        shadow: style.boxShadow,
      };
    });
    expect(focused.outline !== "none" || focused.shadow !== "none").toBe(true);
    reached = /Install options/.test(focused.text);
  }
  expect(reached).toBe(true);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no running animations or smooth scrolling", async ({ page }) => {
    await page.goto("/");
    const state = await page.evaluate(() => ({
      running: document.getAnimations().filter((animation) => {
        const timing = animation.effect?.getComputedTiming();
        return (
          animation.playState === "running" &&
          Number(timing?.duration ?? 0) > 10
        );
      }).length,
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    expect(state).toEqual({ running: 0, scroll: "auto" });
  });
});

test("metadata: canonical, social card, icons, manifest, robots, structured data", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const meta = await page.evaluate(() => ({
    canonical: document
      .querySelector("link[rel=canonical]")
      ?.getAttribute("href"),
    ogImage: document
      .querySelector("meta[property='og:image']")
      ?.getAttribute("content"),
    twitterImage: document
      .querySelector("meta[name='twitter:image']")
      ?.getAttribute("content"),
    touchIcon: document
      .querySelector("link[rel=apple-touch-icon]")
      ?.getAttribute("href"),
    manifest: document
      .querySelector("link[rel=manifest]")
      ?.getAttribute("href"),
    description: document
      .querySelector("meta[name=description]")
      ?.getAttribute("content"),
  }));
  expect(meta.canonical).toBe("https://tie.md/");
  expect(meta.ogImage).toMatch(/\/img\/tie-social-card\.png$/);
  expect(meta.twitterImage).toMatch(/\.png$/);
  expect(meta.description?.length).toBeGreaterThan(50);
  // Crawlers read the static HTML, so check structured data there.
  const html = await (await request.get("/")).text();
  const jsonLd = html.match(
    /<script[^>]*application\/ld\+json[^>]*>(.*?)<\/script>/su,
  )?.[1];
  expect(
    JSON.parse(jsonLd ?? "{}")["@graph"].map(
      (node: { "@type": string }) => node["@type"],
    ),
  ).toEqual(["SoftwareApplication", "FAQPage"]);
  for (const asset of [
    meta.touchIcon,
    meta.manifest,
    "/robots.txt",
    "/sitemap.xml",
    "/img/tie-social-card.png",
  ]) {
    const response = await request.get(String(asset));
    expect(response.status(), String(asset)).toBe(200);
  }
  const manifest = await (await request.get(String(meta.manifest))).json();
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );
});

test("demonstrations are labelled as examples and never call a local service", async ({
  page,
}) => {
  const local: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.port === "4317" || url.pathname.startsWith("/api/"))
      local.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const demo = page.locator("pre[aria-live]");
  await expect(page.getByText("Illustrative example")).toBeVisible();
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    await expect(demo).toBeVisible();
  }
  expect(local).toEqual([]);
});

test("performance budget: landing transfer and built JavaScript stay small", async ({
  page,
}) => {
  let bytes = 0;
  page.on("response", async (response) => {
    const length = Number(response.headers()["content-length"] ?? 0);
    bytes +=
      length || (await response.body().catch(() => Buffer.alloc(0))).length;
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(bytes).toBeLessThan(900 * 1024);

  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1]?.startTime ?? 0);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(-1), 3000);
      }),
  );
  expect(lcp).toBeGreaterThan(0);
  expect(lcp).toBeLessThan(2500);

  const assets = join(import.meta.dirname, "..", "build", "assets", "js");
  let js = 0;
  for (const file of await readdir(assets))
    js += (await stat(join(assets, file))).size;
  expect(js).toBeLessThan(3 * 1024 * 1024);
});

test.describe("visual baselines", () => {
  test.use({ reducedMotion: "reduce" });
  const views = [
    { name: "desktop", viewport: { width: 1280, height: 860 } },
    { name: "compact", viewport: { width: 390, height: 844 } },
  ];
  for (const colorScheme of ["light", "dark"] as const) {
    for (const { name, viewport } of views) {
      for (const path of ["/", "/install"]) {
        test(`${path} ${name} ${colorScheme}`, async ({ page }) => {
          await page.emulateMedia({ colorScheme });
          await page.setViewportSize(viewport);
          // Keep the consent banner out of the brand baseline.
          await page.addInitScript(() =>
            localStorage.setItem("tie-analytics-consent", "denied"),
          );
          await page.goto(path, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          await expect(page).toHaveScreenshot(
            `${path === "/" ? "home" : "install"}-${name}-${colorScheme}.png`,
            { maxDiffPixelRatio: 0.01 },
          );
        });
      }
    }
  }
});
