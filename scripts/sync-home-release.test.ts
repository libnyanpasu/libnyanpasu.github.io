import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  compareReleases,
  isCompleteRelease,
  releaseSnapshot,
  syncHomeRelease,
} from "./sync-home-release.ts";
import type { GitHubRelease } from "./sync-home-release.ts";

function release(tag: string, overrides: Partial<GitHubRelease> = {}): GitHubRelease {
  return {
    tag_name: tag,
    draft: false,
    prerelease: false,
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
    })),
    ...overrides,
  };
}

test("orders versions numerically and promotes stable over prereleases", () => {
  const tags = [
    "v2.0.0-rc.2",
    "v1.6.1",
    "v2.0.0-beta.3",
    "v2.0.0",
    "v2.0.0-rc.10",
    "v2.0.0-alpha.9",
  ];
  assert.deepEqual(
    tags
      .map((tag) => release(tag))
      .sort(compareReleases)
      .map((item) => item.tag_name),
    ["v2.0.0", "v2.0.0-rc.10", "v2.0.0-rc.2", "v2.0.0-beta.3", "v2.0.0-alpha.9", "v1.6.1"],
  );
  assert.equal(releaseSnapshot(release("v2.0.0-rc.2")).channel, "rc");
  assert.equal(releaseSnapshot(release("v2.0.0")).channel, "stable");
});

test("excludes rolling, draft, empty and incomplete releases", () => {
  assert.equal(isCompleteRelease(release("pre-release")), false);
  assert.equal(isCompleteRelease(release("v2.0.0", { draft: true })), false);
  const incomplete = release("v2.0.0");
  incomplete.assets.pop();
  assert.equal(isCompleteRelease(incomplete), false);
  const empty = release("v2.0.0");
  empty.assets[0].size = 0;
  assert.equal(isCompleteRelease(empty), false);
  const uploading = release("v2.0.0");
  uploading.assets[0].state = "open";
  assert.equal(isCompleteRelease(uploading), false);
  assert.equal(isCompleteRelease(release("v2.0.0-rc.2")), true);
});

test("a delayed notification selects the newest complete release and renders matching links", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "home-release-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, "release.json");
  const old = release("v2.0.0-rc.1");
  const latest = release("v2.0.0-rc.2");
  const incomplete = release("v2.0.0", { assets: [] });
  t.mock.method(
    globalThis,
    "fetch",
    async (url: string) =>
      new Response(
        JSON.stringify(
          url.includes("/tags/") ? old : [incomplete, old, release("pre-release"), latest],
        ),
      ),
  );
  const snapshot = await syncHomeRelease({ tag: old.tag_name, output });
  assert.equal(snapshot.version, "2.0.0-rc.2");
  assert.equal(
    snapshot.href,
    "https://github.com/libnyanpasu/clash-nyanpasu/releases/tag/v2.0.0-rc.2",
  );
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), snapshot);
});

test("API and explicit-tag failures preserve the existing snapshot", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "home-release-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, "release.json");
  await writeFile(output, "previous snapshot");
  const mock = t.mock.method(globalThis, "fetch", async () => new Response("", { status: 503 }));
  await assert.rejects(syncHomeRelease({ output }), /HTTP 503/);
  mock.mock.mockImplementation(async () => new Response("", { status: 404 }));
  await assert.rejects(syncHomeRelease({ tag: "v9.0.0", output }), /HTTP 404/);
  mock.mock.mockImplementation(
    async () => new Response(JSON.stringify(release("v9.0.0", { assets: [] }))),
  );
  await assert.rejects(syncHomeRelease({ tag: "v9.0.0", output }), /missing platform packages/);
  await assert.rejects(syncHomeRelease({ tag: "pre-release", output }), /Unsupported release tag/);
  assert.equal(await readFile(output, "utf8"), "previous snapshot");
});

test("uses the completed notified release when the release list has not caught up", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "home-release-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  t.mock.method(
    globalThis,
    "fetch",
    async (url: string) =>
      new Response(
        JSON.stringify(url.includes("/tags/") ? release("v2.0.0-rc.2") : [release("v2.0.0-rc.1")]),
      ),
  );
  const snapshot = await syncHomeRelease({
    tag: "v2.0.0-rc.2",
    output: join(directory, "release.json"),
  });
  assert.equal(snapshot.version, "2.0.0-rc.2");
});

test("paginates releases rather than assuming the first page contains a version", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "home-release-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const pages: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    pages.push(url);
    return new Response(
      JSON.stringify(
        url.endsWith("page=1")
          ? Array.from({ length: 100 }, () => release("pre-release"))
          : [release("v2.0.0-rc.2")],
      ),
    );
  });
  const result = await syncHomeRelease({ output: join(directory, "release.json") });
  assert.equal(pages.length, 2);
  assert.equal(result.version, "2.0.0-rc.2");
});
