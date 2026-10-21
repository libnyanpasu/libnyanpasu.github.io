export type DownloadOs = "windows" | "macos" | "linux";
export type DownloadArch = "x64" | "arm64";
export type DownloadFormat = "exe" | "zip" | "dmg" | "deb" | "rpm" | "appimage";
export type DownloadSourceId = "nyanpasu" | "sourceforge" | "ghfast" | "github";

export interface DownloadAsset {
  id: string;
  name: string;
  os: DownloadOs;
  arch: DownloadArch;
  format: DownloadFormat;
  variant?: "fixed-webview";
  size: number;
  sha256?: string;
  urls: Partial<Record<DownloadSourceId, string>>;
}

export interface DownloadSource {
  id: DownloadSourceId;
  label: string;
  probeUrl?: string;
}

export interface DownloadCatalog {
  version: string;
  tag: string;
  channel: string;
  releaseUrl: string;
  publishedAt: string;
  sources: DownloadSource[];
  assets: DownloadAsset[];
}
