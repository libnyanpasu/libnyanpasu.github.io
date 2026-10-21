import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { dev } from "astro";
import { chromium } from "playwright";
import type { Browser, BrowserContext, Page } from "playwright";
import sharp from "sharp";

let browser: Browser;
let server: Awaited<ReturnType<typeof dev>> | undefined;
let baseUrl = process.env.DOWNLOAD_TEST_BASE_URL || "";
const errors: string[] = [];

before(async () => {
  if (!baseUrl) {
    server = await dev({
      root: fileURLToPath(new URL("../", import.meta.url)),
      server: { host: "127.0.0.1", port: 0 },
      devToolbar: { enabled: false },
      logLevel: "error",
    });
    baseUrl = `http://127.0.0.1:${server.address.port}`;
  }
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  await server?.stop();
});

async function pageFor(context: BrowserContext, path: string): Promise<Page> {
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|hydrated|Minified React error/i.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto(`${baseUrl}${path}`);
  await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
  return page;
}

test("forced device and mirror are reflected in the real installer URL and can be changed without forms", async () => {
  const context = await browser.newContext();
  try {
    const page = await pageFor(
      context,
      "/zh-cn/download/?os=windows&arch=arm64&mirror=sourceforge",
    );
    const action = page.locator('[data-slot="download-action"]');
    assert.match(
      (await action.getAttribute("href"))!,
      /^https:\/\/downloads\.sourceforge\.net\/.+arm64-setup\.exe$/,
    );
    const device = page.locator('[data-slot="device-selector"]');
    const source = page.locator('[data-slot="source-selector"]');
    assert.equal(await device.getAttribute("aria-expanded"), "false");
    assert.equal(await source.getAttribute("aria-expanded"), "false");
    assert.equal(await page.locator("main select, main input").count(), 0);
    const [deviceBox, sourceBox] = await Promise.all([device.boundingBox(), source.boundingBox()]);
    assert.ok(Math.abs(deviceBox!.width - sourceBox!.width) < 1);
    assert.ok(Math.abs(deviceBox!.height - sourceBox!.height) < 1);

    await device.click();
    await page.getByRole("button", { name: "Linux", exact: true }).click();
    await page.locator('[data-asset-id$="_arm64.deb"]').click();
    assert.match((await action.getAttribute("href"))!, /arm64\.deb$/);
    await source.click();
    await page.locator('[data-source="github"]').click();
    assert.match((await action.getAttribute("href"))!, /^https:\/\/github\.com\/.+arm64\.deb$/);
    await source.click();
    await page.getByRole("button", { name: "重新检测", exact: true }).click();
    assert.match((await action.getAttribute("href"))!, /^https:\/\/github\.com\/.+arm64\.deb$/);
    await source.press("Escape");
    assert.equal(await source.getAttribute("aria-expanded"), "false");
    assert.equal(await source.evaluate((element) => document.activeElement === element), true);
    assert.match(page.url(), /mirror=github/);
    await page.reload();
    await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
    assert.match((await action.getAttribute("href"))!, /^https:\/\/github\.com\/.+arm64\.deb$/);
  } finally {
    await context.close();
  }
});

test("late client hints cannot replace an explicitly chosen package", async () => {
  const context = await browser.newContext();
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "userAgentData", {
        value: {
          platform: "Windows",
          mobile: false,
          getHighEntropyValues: () =>
            new Promise((resolve) => {
              (window as Window & { finishDownloadHints?: () => void }).finishDownloadHints = () =>
                resolve({ architecture: "arm", bitness: "64" });
            }),
        },
      });
    });
    const page = await pageFor(context, "/zh-cn/download/");
    await page.locator('[data-slot="device-selector"]').click();
    await page.getByRole("button", { name: "macOS", exact: true }).click();
    await page.locator('[data-asset-id$="_x64.dmg"]').click();
    await page.evaluate(() =>
      (window as Window & { finishDownloadHints?: () => void }).finishDownloadHints?.(),
    );
    assert.match(
      (await page.locator('[data-slot="download-action"]').getAttribute("href"))!,
      /_x64\.dmg$/,
    );
  } finally {
    await context.close();
  }
});

test("unknown macOS architecture and unavailable forced combinations prompt an explicit choice", async () => {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15",
  });
  try {
    await context.addInitScript(() =>
      Object.defineProperty(navigator, "userAgentData", { value: undefined }),
    );
    const page = await pageFor(context, "/zh-cn/download/");
    assert.equal(await page.locator('[data-slot="download-action"]').getAttribute("href"), null);
    await page.locator('[data-slot="download-action"]').click();
    assert.equal(
      await page.locator('[data-slot="device-selector"]').getAttribute("aria-expanded"),
      "true",
    );
    await page.goto(`${baseUrl}/zh-cn/download/?os=linux&arch=arm64&format=appimage`);
    await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
    assert.equal(await page.locator('[data-slot="download-action"]').getAttribute("href"), null);
    assert.equal(await page.getByRole("status").count(), 1);
  } finally {
    await context.close();
  }
});

test("selectors fit mobile and dark layouts, with immediate reduced-motion expansion", async () => {
  const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "dark" });
  try {
    const page = await pageFor(context, "/zh-cn/download/?os=windows&arch=x64");
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('[data-slot="device-selector"]').click();
      await page.getByRole("button", { name: "Windows", exact: true }).click();
      await page.waitForFunction(() => {
        const panel = document.querySelector("#download-device-options")!;
        return panel.clientHeight >= panel.firstElementChild!.getBoundingClientRect().height - 1;
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.locator('[data-slot="device-selector"]').press("Escape");
    }
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.goto(`${baseUrl}/download/?os=windows&arch=x64`);
    assert.equal(await page.locator("h1").textContent(), "Download");
    await page.goto(`${baseUrl}/zh-cn/`);
    const hrefs = await page
      .locator(".platform-action")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    assert.deepEqual(hrefs.sort(), [
      "/zh-cn/download/?os=linux",
      "/zh-cn/download/?os=macos",
      "/zh-cn/download/?os=windows",
    ]);
  } finally {
    await context.close();
  }
});

test("native installer links remain available without JavaScript", async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    await page.goto(`${baseUrl}/zh-cn/download/`);
    const fallback = page.locator("noscript .download-page__fallback");
    assert.ok((await fallback.count()) >= 6);
    await fallback.first().locator("summary").click();
    assert.ok((await fallback.first().getByRole("link").count()) >= 3);
    assert.equal(await page.locator('[data-slot="download-panel"]').isVisible(), false);
  } finally {
    await context.close();
  }
});

test("image probes work without CORS, rank real completion times, and expire cached results", async () => {
  const context = await browser.newContext();
  try {
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: "#1867c0" } })
      .png()
      .toBuffer();
    const page = await pageFor(context, "/download/?os=windows&arch=x64");
    await page.route("https://probe-*.invalid/**", async (route) => {
      const url = route.request().url();
      if (url.includes("probe-ghfast")) return route.fulfill({ status: 404, body: "Missing" });
      await new Promise((resolve) => setTimeout(resolve, url.includes("probe-github") ? 30 : 300));
      // Intentionally omit Access-Control-Allow-Origin: images must work without it.
      await route.fulfill({ status: 200, contentType: "image/png", body: png });
    });
    const result = await page.evaluate(async () => {
      const modulePath = "/src/lib/downloads/probe.ts";
      const probes = await import(modulePath);
      const results = await probes.probeSources(
        [
          {
            id: "nyanpasu",
            label: "Nyanpasu",
            probeUrl: "https://probe-nyanpasu.invalid/download-probe.png",
          },
          {
            id: "github",
            label: "GitHub",
            probeUrl: "https://probe-github.invalid/download-probe.png",
          },
          {
            id: "ghfast",
            label: "GHFast",
            probeUrl: "https://probe-ghfast.invalid/download-probe.png",
          },
          { id: "sourceforge", label: "SourceForge" },
        ],
        new AbortController().signal,
      );
      const key = "download-probe-browser-test";
      probes.writeProbeCache(key, results);
      const cached = probes.readProbeCache(key);
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now() - 6 * 60_000, results }));
      const expired = probes.readProbeCache(key);
      sessionStorage.removeItem(key);
      return { results, cached, expired };
    });
    assert.equal(
      result.results.find((item: { id: string }) => item.id === "github").status,
      "ready",
    );
    assert.equal(
      result.results.find((item: { id: string }) => item.id === "ghfast").status,
      "unmeasurable",
    );
    assert.equal(
      result.results.find((item: { id: string }) => item.id === "sourceforge").status,
      "unmeasurable",
    );
    assert.ok(
      result.results.find((item: { id: string }) => item.id === "github").elapsed <
        result.results.find((item: { id: string }) => item.id === "nyanpasu").elapsed,
    );
    assert.deepEqual(result.cached, result.results);
    assert.equal(result.expired, undefined);
  } finally {
    await context.close();
  }
});

test("native page transitions retain theme, selection, and back history", async () => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "no-preference",
  });
  try {
    await context.addInitScript(() => {
      if (!/^https?:$/.test(location.protocol)) return;
      addEventListener("pagereveal", (event) => {
        const transition = (event as Event & { viewTransition?: ViewTransition }).viewTransition;
        if (!transition) return;
        void transition.ready
          .then(() => {
            sessionStorage.setItem(
              "download-test-animation",
              getComputedStyle(document.documentElement, "::view-transition-new(root)")
                .animationName,
            );
          })
          .catch(() => {});
      });
    });
    const page = await pageFor(context, "/zh-cn/download/?os=windows&arch=x64&mirror=github");
    await page.locator("starlight-theme-select select").selectOption("dark");
    await page.locator(".home-header__desktop-nav a").filter({ hasText: "主页" }).click();
    await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/zh-cn");
    await page.waitForFunction(
      () => sessionStorage.getItem("download-test-animation") === "page-arrive",
    );
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    await page.evaluate(() => sessionStorage.removeItem("download-test-animation"));
    await page.locator(".hero-actions a").first().click();
    await page.waitForURL("**/zh-cn/download/");
    await page.waitForFunction(
      () => sessionStorage.getItem("download-test-animation") === "page-arrive",
    );
    await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
    await page.goBack();
    await page.waitForURL((url) => url.pathname.replace(/\/$/, "") === "/zh-cn");
    await page.goBack();
    await page.waitForURL(
      (url) => url.pathname === "/zh-cn/download/" && url.searchParams.get("mirror") === "github",
    );
    await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
    assert.match(
      (await page.locator('[data-slot="download-action"]').getAttribute("href"))!,
      /^https:\/\/github\.com\/.+x64-setup\.exe$/,
    );
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await page.locator("starlight-theme-select select").inputValue(), "dark");
  } finally {
    await context.close();
  }
});

test("reduced motion opts out of native page transitions while navigation works", async () => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  try {
    await context.addInitScript(() => {
      if (!/^https?:$/.test(location.protocol)) return;
      addEventListener("pagereveal", (event) => {
        sessionStorage.setItem(
          "download-test-transition",
          String(Boolean((event as Event & { viewTransition?: ViewTransition }).viewTransition)),
        );
      });
    });
    const page = await pageFor(context, "/zh-cn/download/?os=windows&arch=x64");
    await page.locator(".home-header__desktop-nav a").filter({ hasText: "文档" }).click();
    await page.waitForURL("**/zh-cn/introduction/");
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem("download-test-transition")),
      "false",
    );
    await page.goBack();
    await page.waitForURL("**/zh-cn/download/?os=windows&arch=x64");
    await page.locator('[data-slot="download-panel"][data-initialized="true"]').waitFor();
    assert.equal(
      await page.evaluate(() => sessionStorage.getItem("download-test-transition")),
      "false",
    );
  } finally {
    await context.close();
  }
});

test("no client runtime errors occurred", () => assert.deepEqual(errors, []));
