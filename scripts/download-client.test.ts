import assert from "node:assert/strict";
import test from "node:test";
import { detectDevice, detectDeviceWithHints } from "../src/lib/downloads/device.ts";
import {
  initialSelection,
  resolveSource,
  selectionParams,
} from "../src/lib/downloads/selection.ts";
import type { DownloadCatalog } from "../src/lib/downloads/types.ts";

const catalog: DownloadCatalog = {
  version: "2.0.0-rc.2",
  tag: "v2.0.0-rc.2",
  channel: "rc",
  publishedAt: "",
  releaseUrl: "https://github.com/libnyanpasu/clash-nyanpasu/releases/tag/v2.0.0-rc.2",
  sources: [
    { id: "nyanpasu", label: "Nyanpasu" },
    { id: "github", label: "GitHub" },
    { id: "sourceforge", label: "SourceForge" },
  ],
  assets: [
    {
      id: "mac-arm",
      name: "apple.dmg",
      os: "macos",
      arch: "arm64",
      format: "dmg",
      size: 100,
      urls: {
        nyanpasu: "https://mirror.example/apple.dmg",
        github: "https://github.com/apple.dmg",
      },
    },
    {
      id: "win-x64",
      name: "setup.exe",
      os: "windows",
      arch: "x64",
      format: "exe",
      size: 100,
      urls: {
        nyanpasu: "https://mirror.example/setup.exe",
        github: "https://github.com/setup.exe",
        sourceforge: "https://downloads.sourceforge.net/setup.exe",
      },
    },
    {
      id: "win-arm",
      name: "arm.exe",
      os: "windows",
      arch: "arm64",
      format: "exe",
      size: 100,
      urls: { nyanpasu: "https://mirror.example/arm.exe" },
    },
    {
      id: "win-fixed",
      name: "fixed.exe",
      os: "windows",
      arch: "x64",
      format: "exe",
      variant: "fixed-webview",
      size: 200,
      urls: { nyanpasu: "https://mirror.example/fixed.exe" },
    },
    {
      id: "linux-arm",
      name: "arm.deb",
      os: "linux",
      arch: "arm64",
      format: "deb",
      size: 100,
      urls: { github: "https://github.com/arm.deb" },
    },
  ],
};

test("desktop detection keeps macOS architecture unknown and excludes disguised mobile UAs", () => {
  assert.deepEqual(
    detectDevice({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      platform: "MacIntel",
    }),
    { os: "macos", arch: undefined, mobile: false },
  );
  assert.deepEqual(
    detectDevice({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
      platform: "MacIntel",
      maxTouchPoints: 5,
    }),
    { mobile: true },
  );
  assert.deepEqual(detectDevice({ userAgent: "Mozilla/5.0 (Linux; Android 16; arm64)" }), {
    mobile: true,
  });
  assert.equal(
    detectDevice({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }).arch,
    "x64",
  );
  assert.equal(detectDevice({ userAgent: "Mozilla/5.0 (X11; Linux aarch64)" }).arch, "arm64");
  assert.equal(detectDevice({ userAgent: "Mozilla/5.0 (X11; CrOS x86_64)" }).os, undefined);
});

test("high entropy hints identify ARM Windows despite an emulated x64 UA and safely handle denial", async () => {
  const nav = {
    userAgent: "Windows NT 10.0; Win64; x64",
    userAgentData: {
      platform: "Windows",
      getHighEntropyValues: async () => ({ architecture: "arm", bitness: "64" }),
    },
  };
  assert.equal((await detectDeviceWithHints(nav)).arch, "arm64");
  nav.userAgentData.getHighEntropyValues = async () => {
    throw new Error("Denied");
  };
  assert.equal((await detectDeviceWithHints(nav)).arch, "x64");
  const narrow = {
    ...nav,
    userAgentData: {
      platform: "Windows",
      getHighEntropyValues: async () => ({ architecture: "x86", bitness: "32" }),
    },
  };
  assert.equal((await detectDeviceWithHints(narrow)).arch, undefined);
});

test("forced target and source override detection, unavailable formats cannot silently change packages", () => {
  const device = { os: "macos" as const, arch: "arm64" as const, mobile: false };
  const forced = initialSelection(
    catalog,
    device,
    new URLSearchParams("os=windows&arch=x64&format=exe&mirror=sourceforge"),
  );
  assert.equal(forced.assetId, "win-x64");
  assert.equal(forced.source, "sourceforge");
  assert.equal(forced.unavailable, false);
  assert.equal(
    initialSelection(catalog, device, new URLSearchParams("os=windows")).assetId,
    undefined,
  );
  assert.equal(
    initialSelection(catalog, device, new URLSearchParams("os=linux&arch=arm64&format=appimage"))
      .unavailable,
    true,
  );
  assert.equal(
    initialSelection(catalog, device, new URLSearchParams("mirror=https://evil.invalid"))
      .unavailable,
    true,
  );
  assert.equal(
    initialSelection(catalog, device, new URLSearchParams("os=constructor")).unavailable,
    true,
  );
});

test("fixed WebView is an explicit variant and selections can round-trip through the URL", () => {
  const device = { os: "windows" as const, arch: "x64" as const, mobile: false };
  assert.equal(initialSelection(catalog, device, new URLSearchParams()).assetId, "win-x64");
  const asset = catalog.assets.find((item) => item.id === "win-fixed")!;
  const params = selectionParams(asset, "nyanpasu");
  assert.equal(initialSelection(catalog, device, params).assetId, "win-fixed");
});

test("automatic source selection ranks successful probes for this asset while forced sources stay locked", () => {
  const asset = catalog.assets[1];
  const measurements = [
    { id: "nyanpasu" as const, status: "ready", elapsed: 500 },
    { id: "github" as const, status: "ready", elapsed: 100 },
    { id: "sourceforge" as const, status: "timeout", elapsed: 1 },
  ];
  assert.equal(resolveSource(asset, "auto", measurements), "github");
  assert.equal(resolveSource(asset, "sourceforge", measurements), "sourceforge");
  assert.equal(resolveSource(catalog.assets[0], "sourceforge", measurements), undefined);
  assert.equal(resolveSource(catalog.assets[4], "auto", measurements), "github");
  assert.equal(resolveSource(asset, "auto", []), "nyanpasu");
});
