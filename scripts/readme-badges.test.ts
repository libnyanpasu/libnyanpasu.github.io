import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { generateReadmeBadges, readmeBadges, renderBadge } from "./readme-badges.ts";

function release(tag = "v2.0.0-rc.2") {
  return {
    tag_name: tag,
    draft: false,
    prerelease: true,
    assets: [
      "_x64-setup.exe",
      "_arm64-setup.exe",
      "_amd64.deb",
      "_arm64.deb",
      "_x64.dmg",
      "_aarch64.dmg",
    ].map((suffix) => ({
      name: `Clash.Nyanpasu_${tag.replace(/^v/, "")}${suffix}`,
      state: "uploaded",
      size: 100,
      download_count: 7,
    })),
  };
}

function github(t: TestContext, overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    "/repos/libnyanpasu/clash-nyanpasu": {
      stargazers_count: 12345,
      default_branch: "main",
      license: { spdx_id: "GPL-3.0" },
    },
    "/repos/libnyanpasu/clash-nyanpasu/releases?per_page=100&page=1": [release()],
    "/search/issues?q=repo%3Alibnyanpasu%2Fclash-nyanpasu%20is%3Aissue%20is%3Aopen&per_page=1": {
      total_count: 8,
    },
    "/repos/libnyanpasu/clash-nyanpasu/actions/workflows/ci.yml/runs?per_page=1&event=push&branch=main":
      {
        workflow_runs: [
          {
            status: "completed",
            conclusion: "success",
            html_url: "https://github.com/libnyanpasu/clash-nyanpasu/actions/runs/123",
          },
        ],
      },
    ...overrides,
  };
  return t.mock.method(globalThis, "fetch", async (input: string, options?: RequestInit) => {
    const url = new URL(input);
    assert.equal(url.origin, "https://api.github.com");
    assert.ok(options?.signal, "Every request needs a network deadline");
    const key = url.pathname + url.search;
    assert.ok(key in responses, `Unexpected GitHub request: ${key}`);
    return new Response(JSON.stringify(responses[key]));
  });
}

test("selects the newest complete RC, excludes PRs from Issues, and preserves community links", async (t) => {
  github(t, {
    "/repos/libnyanpasu/clash-nyanpasu/releases?per_page=100&page=1": [
      release(),
      release("v2.0.0-rc.10"),
      { ...release("v3.0.0"), assets: [] },
      { ...release("v4.0.0"), draft: true },
    ],
  });
  const badges = await readmeBadges();
  const byId = Object.fromEntries(badges.map((badge) => [badge.id, badge]));
  assert.equal(byId.release.value, "v2.0.0-rc.10");
  assert.ok(byId.release.href.endsWith("/releases/tag/v2.0.0-rc.10"));
  assert.equal(byId.stars.value, "12,345");
  assert.equal(byId.issues.value, "8");
  assert.equal(byId.build.value, "passing");
  assert.ok(byId.build.href.endsWith("/actions/runs/123"));
  assert.equal(byId.follow.href, "https://x.com/ClashNyanpasu");
  assert.equal(byId.docs.href, "https://nyanpasu.org");
  assert.equal(byId["telegram-channel"].href, "https://t.me/ClashNyanpasu");
  assert.equal(byId["telegram-group"].href, "https://t.me/+IGNnkH5k7WE3MzA1");
});

test("totals every release page, includes rolling releases, and excludes drafts", async (t) => {
  const rolling = {
    ...release("pre-release"),
    assets: [{ ...release().assets[0], download_count: 1 }],
  };
  github(t, {
    "/repos/libnyanpasu/clash-nyanpasu/releases?per_page=100&page=1": [
      release(),
      ...Array.from({ length: 98 }, () => rolling),
      { ...release("v9.0.0"), draft: true },
    ],
    "/repos/libnyanpasu/clash-nyanpasu/releases?per_page=100&page=2": [
      { ...rolling, assets: [{ ...rolling.assets[0], download_count: 4 }] },
    ],
  });
  assert.equal((await readmeBadges()).find((badge) => badge.id === "downloads")?.value, "144");
});

test("shows pending, cancelled, missing and failed builds without reporting success", async (t) => {
  const fetch = github(t);
  for (const [status, conclusion, expected] of [
    ["in_progress", null, "in progress"],
    ["queued", null, "queued"],
    ["completed", "cancelled", "cancelled"],
    ["completed", "failure", "failing"],
    ["completed", null, "unknown"],
  ]) {
    fetch.mock.mockImplementation(async (input: string) => {
      const path = new URL(input).pathname;
      return new Response(
        JSON.stringify(
          path.includes("/runs")
            ? { workflow_runs: [{ status, conclusion, html_url: "https://github.com/run" }] }
            : path.includes("/releases")
              ? [release()]
              : path.includes("/search")
                ? { total_count: 1 }
                : { stargazers_count: 1, default_branch: "main", license: null },
        ),
      );
    });
    const badge = (await readmeBadges()).find((item) => item.id === "build")!;
    assert.equal(badge.value, expected);
    if (expected === "failing") assert.equal(badge.tone, "error");
  }
  fetch.mock.mockImplementation(
    async (input: string) =>
      new Response(
        JSON.stringify(
          input.includes("/runs")
            ? { workflow_runs: [] }
            : input.includes("/releases?")
              ? [release()]
              : input.includes("/search/")
                ? { total_count: 1 }
                : { stargazers_count: 1, default_branch: "main", license: null },
        ),
      ),
  );
  const badges = await readmeBadges();
  assert.equal(badges.find((badge) => badge.id === "build")?.value, "no runs");
  assert.equal(badges.find((badge) => badge.id === "license")?.value, "not specified");
});

test("renders standalone SVGs in both themes and escapes upstream text", async (t) => {
  github(t);
  const badges = await readmeBadges();
  for (const badge of badges) {
    for (const theme of ["light", "dark"] as const) {
      const svg = renderBadge(badge, theme);
      assert.ok(svg.includes('role="img"'));
      assert.ok(svg.includes('rx="16"'));
      const image = await sharp(Buffer.from(svg)).metadata();
      assert.equal(image.height, 32);
      assert.ok(image.width! > 32);
    }
  }
  const injected = renderBadge(
    { id: "test", label: '<script>&"', value: "0", icon: "star-rounded", href: "#" },
    "light",
  );
  assert.ok(!injected.includes("<script>"));
  assert.ok(injected.includes("&lt;script&gt;&amp;&quot;"));
  assert.ok(injected.includes(">0</text>"));
  assert.notEqual(renderBadge(badges[0], "light"), renderBadge(badges[0], "dark"));
});

test("API failures and missing complete releases leave previous output untouched", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "readme-badges-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = pathToFileURL(`${directory}/`);
  await writeFile(new URL("release-light.svg", output), "previous badge");
  const fetch = t.mock.method(
    globalThis,
    "fetch",
    async (_input: string) => new Response("", { status: 403 }),
  );
  await assert.rejects(generateReadmeBadges({ output }), /HTTP 403/);
  fetch.mock.mockImplementation(
    async (input: string) =>
      new Response(
        JSON.stringify(
          input.includes("/releases?")
            ? []
            : input.includes("/search/")
              ? { total_count: 0 }
              : { stargazers_count: 0, default_branch: "main", license: null },
        ),
      ),
  );
  await assert.rejects(generateReadmeBadges({ output }), /No complete versioned release/);
  assert.equal(await readFile(new URL("release-light.svg", output), "utf8"), "previous badge");
});

test("writes all theme variants and a linked preview with optional GitHub authentication", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "readme-badges-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = pathToFileURL(`${directory}/`);
  const fetch = github(t);
  const badges = await generateReadmeBadges({ output, token: "test-token" });
  for (const call of fetch.mock.calls) {
    assert.equal(
      (call.arguments[1]!.headers as Record<string, string>).Authorization,
      "Bearer test-token",
    );
  }
  for (const badge of badges) {
    for (const theme of ["light", "dark"]) {
      assert.match(await readFile(new URL(`${badge.id}-${theme}.svg`, output), "utf8"), /^<svg/);
    }
  }
  const gallery = await readFile(new URL("index.html", output), "utf8");
  assert.ok(gallery.includes('class="light"'));
  assert.ok(gallery.includes('class="dark"'));
  assert.ok(gallery.includes('href="https://t.me/+IGNnkH5k7WE3MzA1"'));
});
