import type { Device } from "./device";
import type { DownloadAsset, DownloadCatalog, DownloadOs, DownloadSourceId } from "./types";

export type SourceChoice = DownloadSourceId | "auto";

export interface DownloadSelection {
  os?: DownloadOs;
  assetId?: string;
  source: SourceChoice;
  unavailable: boolean;
}

export const platformNames: Record<DownloadOs, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

export function initialSelection(
  catalog: DownloadCatalog,
  device: Device,
  params: URLSearchParams,
): DownloadSelection {
  const requestedOs = params.get("os");
  const os =
    requestedOs && Object.hasOwn(platformNames, requestedOs)
      ? (requestedOs as DownloadOs)
      : device.os;
  const requestedArch = params.get("arch");
  const arch = requestedArch || (device.os === os ? device.arch : undefined);
  const format = params.get("format");
  const variant = params.get("variant");
  const source = params.get("mirror");
  const invalidOs = requestedOs !== null && !Object.hasOwn(platformNames, requestedOs);
  const candidates = catalog.assets.filter(
    (asset) =>
      asset.os === os &&
      asset.arch === arch &&
      (!format || asset.format === format) &&
      (variant ? asset.variant === variant : !asset.variant),
  );
  const preferred = os === "macos" ? "dmg" : os === "windows" ? "exe" : "appimage";
  const asset = invalidOs
    ? undefined
    : candidates.find((item) => item.format === preferred) || candidates[0];
  const sourceChoice =
    source && catalog.sources.some((item) => item.id === source)
      ? (source as DownloadSourceId)
      : "auto";
  const invalidSource = source !== null && source !== "auto" && source !== sourceChoice;
  return {
    os,
    assetId: asset?.id,
    source: sourceChoice,
    unavailable:
      invalidOs ||
      invalidSource ||
      (!!arch && !asset) ||
      (!!format && !asset) ||
      (!!variant && !asset),
  };
}

export function resolveSource(
  asset: DownloadAsset | undefined,
  choice: SourceChoice,
  results: { id: DownloadSourceId; status: string; elapsed?: number }[],
): DownloadSourceId | undefined {
  if (!asset) return undefined;
  if (choice !== "auto") return asset.urls[choice] ? choice : undefined;
  const measured = results
    .filter((item) => item.status === "ready" && item.elapsed !== undefined && asset.urls[item.id])
    .sort((left, right) => left.elapsed! - right.elapsed!)[0];
  return (
    measured?.id ||
    (["nyanpasu", "sourceforge", "ghfast", "github"] as const).find((id) => asset.urls[id])
  );
}

export function selectionParams(asset: DownloadAsset | undefined, source: SourceChoice) {
  const params = new URLSearchParams();
  if (asset) {
    params.set("os", asset.os);
    params.set("arch", asset.arch);
    params.set("format", asset.format);
    if (asset.variant) params.set("variant", asset.variant);
  }
  if (source !== "auto") params.set("mirror", source);
  return params;
}
