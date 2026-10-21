import assert from "node:assert/strict";
import test from "node:test";
import { buildDownloadCatalog, type ReleaseAsset } from "./download-catalog.ts";

const tag = "v2.0.0-rc.2";
const version = "2.0.0-rc.2";
const names = [
  `Clash.Nyanpasu_${version}_x64-setup.exe`,
  `Clash.Nyanpasu_${version}_arm64-setup.exe`,
  `Clash.Nyanpasu_${version}_fixed-webview-x64-setup.exe`,
  `Clash.Nyanpasu_${version}_fixed-webview-arm64-setup.exe`,
  `Clash.Nyanpasu_${version}_x86_64_portable.zip`,
  `Clash.Nyanpasu_${version}_aarch64_fixed-webview_portable.zip`,
  `Clash.Nyanpasu_${version}_x64.dmg`,
  `Clash.Nyanpasu_${version}_aarch64.dmg`,
  `Clash.Nyanpasu_${version}_amd64.deb`,
  "Clash.Nyanpasu-2.0.0-0.rc.2.x86_64.rpm",
  `Clash.Nyanpasu_${version}_amd64.AppImage`,
  `Clash.Nyanpasu_${version}_x64-updater.exe`,
  `Clash.Nyanpasu_${version}_x64-setup.nsis.zip`,
  `Clash.Nyanpasu_${version}_x64-setup.exe.sig`,
];
const probeDigest = "b".repeat(64);
function release(assets = [...names, "download-sources.json"]): {
  tag_name: string;
  published_at: string;
  assets: ReleaseAsset[];
} {
  return {
    tag_name: tag,
    published_at: "2026-10-14T20:17:41.873Z",
    assets: assets.map((name) => ({
      name,
      size: name === "download-probe.png" ? 20 : 100,
      state: "uploaded",
      ...(name === "download-probe.png" ? { digest: `sha256:${probeDigest}` } : {}),
    })),
  };
}
const sourcePrefix = (id: string) =>
  id === "nyanpasu"
    ? `https://nyanpasu-script.majokeiko.com/libnyanpasu/clash-nyanpasu/releases/download/${tag}/`
    : id === "github"
      ? `https://github.com/libnyanpasu/clash-nyanpasu/releases/download/${tag}/`
      : `https://ghfast.top/https://github.com/libnyanpasu/clash-nyanpasu/releases/download/${tag}/`;
const sourceMetadata = {
  schemaVersion: 1,
  tag,
  sources: ["nyanpasu", "github", "ghfast"].map((id) => ({
    id,
    label: id,
    assetUrlPrefix: sourcePrefix(id),
    probeUrl: `${sourcePrefix(id)}download-probe.png`,
  })),
};
function mirror(assets: Record<string, { url: string; fileSize: number; sha256: string }>) {
  return {
    schemaVersion: 1,
    project: "clash-nyanpasu",
    channel: "release",
    buildId: tag,
    remotePath: `releases/${tag}`,
    assets,
  };
}
const sfEntry = (name: string, size: number, sha256: string, pathName = name) => ({
  url: `https://downloads.sourceforge.net/project/clash-nyanpasu/releases/${tag}/${encodeURIComponent(pathName)}`,
  fileSize: size,
  sha256,
});

test("selects exact-version installers, portable and fixed-WebView variants, RPMs, and legacy formats", async () => {
  const catalog = await buildDownloadCatalog(
    release(["download-probe.png", ...names, "download-sources.json"]),
    { fetchMetadata: async () => sourceMetadata },
  );
  assert.equal(catalog.assets.length, 11);
  assert.equal(catalog.channel, "rc");
  assert.equal(
    catalog.sources.find((source) => source.id === "nyanpasu")?.probeUrl,
    `${sourcePrefix("nyanpasu")}download-probe.png`,
  );
  assert.ok(catalog.assets.some((asset) => asset.name.includes("fixed-webview-x64-setup.exe")));
  assert.ok(
    catalog.assets.some((asset) => asset.name === "Clash.Nyanpasu-2.0.0-0.rc.2.x86_64.rpm"),
  );
  assert.ok(catalog.assets.every((asset) => asset.urls.github));
  assert.ok(catalog.assets.every((asset) => !/updater|\.sig$|\.nsis\.zip$/.test(asset.name)));
});

test("excludes recognized file patterns that belong to another exact release version", async () => {
  const wrongVersion = "Clash.Nyanpasu_2.0.0-rc.1_x64-setup.exe";
  const stable = {
    ...release(["Clash.Nyanpasu_2.0.0_x64-setup.exe", "Clash.Nyanpasu-2.0.0-1.x86_64.rpm"]),
    tag_name: "v2.0.0",
  };
  const catalog = await buildDownloadCatalog({
    ...stable,
    assets: [...stable.assets, { name: wrongVersion, size: 100, state: "uploaded" }],
  });
  assert.deepEqual(
    catalog.assets.map((asset) => asset.name),
    ["Clash.Nyanpasu_2.0.0_x64-setup.exe", "Clash.Nyanpasu-2.0.0-1.x86_64.rpm"],
  );
});

test("keeps legacy sources without claiming probes when the PNG is not uploaded", async () => {
  const catalog = await buildDownloadCatalog(release(), {
    fetchMetadata: async () => sourceMetadata,
  });
  assert.equal(catalog.sources.length, 3);
  assert.ok(catalog.sources.every((source) => source.probeUrl === undefined));
});

test("adds SourceForge only for exact mapped assets, retaining hash from the spaced product name", async () => {
  const assetName = `Clash.Nyanpasu_${version}_x64-setup.exe`;
  const hash = "a".repeat(64);
  const sfName = assetName.replace("Clash.Nyanpasu", "Clash Nyanpasu");
  const sfManifest = mirror({
    [sfName]: sfEntry(sfName, 100, hash, sfName),
    "download-probe.png": sfEntry("download-probe.png", 20, probeDigest),
  });
  const assets = release(["download-probe.png", assetName, "sourceforge-mirrors.json"]).assets;
  const catalog = await buildDownloadCatalog(
    { ...release(), assets },
    {
      fetchMetadata: async (asset) =>
        asset.name === "sourceforge-mirrors.json" ? sfManifest : sourceMetadata,
    },
  );
  assert.equal(
    catalog.sources.find((source) => source.id === "sourceforge")?.probeUrl,
    sfEntry("download-probe.png", 20, probeDigest).url,
  );
  assert.equal(catalog.assets[0].urls.sourceforge, sfEntry(sfName, 100, hash, sfName).url);
  assert.equal(catalog.assets[0].sha256, hash);
});

test("rejects URL injection, duplicate metadata, and SourceForge size or hash mismatches", async () => {
  const badMetadata = structuredClone(sourceMetadata);
  badMetadata.sources[0].assetUrlPrefix = "https://attacker.invalid/";
  await assert.rejects(
    buildDownloadCatalog(release(), { fetchMetadata: async () => badMetadata }),
    /Invalid URL/,
  );
  const duplicateMetadata = release(["download-sources.json", "download-sources.json"]);
  await assert.rejects(buildDownloadCatalog(duplicateMetadata), /Duplicate release metadata/);
  const duplicateSf = release(["sourceforge-mirrors.json", "sourceforge-mirrors.json"]);
  await assert.rejects(buildDownloadCatalog(duplicateSf), /Duplicate release metadata/);
  const injectedDownload = {
    ...release([names[0]]),
    assets: [
      {
        ...release([names[0]]).assets[0],
        browser_download_url: "https://attacker.invalid/file.exe",
      },
    ],
  };
  await assert.rejects(buildDownloadCatalog(injectedDownload), /Invalid GitHub download URL/);
  const filename = `Clash.Nyanpasu_${version}_x64-setup.exe`;
  const spaced = filename.replace("Clash.Nyanpasu", "Clash Nyanpasu");
  const sourceRelease = {
    ...release(),
    assets: [
      { ...release([filename]).assets[0], digest: `sha256:${"a".repeat(64)}` },
      { name: "sourceforge-mirrors.json", size: 100, state: "uploaded" },
    ],
  };
  for (const [size, sha256] of [
    [99, "a".repeat(64)],
    [100, "c".repeat(64)],
  ] as const) {
    const badMirror = mirror({ [spaced]: sfEntry(spaced, size, sha256, spaced) });
    await assert.rejects(
      buildDownloadCatalog(sourceRelease, { fetchMetadata: async () => badMirror }),
      /SourceForge asset identity mismatch/,
    );
  }
});
