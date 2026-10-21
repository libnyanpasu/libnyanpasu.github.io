import type {
  DownloadAsset,
  DownloadCatalog,
  DownloadSourceId,
} from "../src/lib/downloads/types.ts";

const repo = "libnyanpasu/clash-nyanpasu";
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;

export interface ReleaseAsset {
  id?: number;
  name: string;
  state: string;
  size: number;
  digest?: string | null;
  browser_download_url?: string;
}
interface Release {
  tag_name: string;
  published_at?: string;
  assets: ReleaseAsset[];
}
interface SourceMetadata {
  schemaVersion: 1;
  tag: string;
  sources: {
    id: "nyanpasu" | "github" | "ghfast";
    label: string;
    assetUrlPrefix: string;
    probeUrl: string;
  }[];
}
interface SourceForgeEntry {
  url: string;
  fileSize: number;
  sha256: string;
}
interface SourceForgeManifest {
  schemaVersion: 1;
  project: "clash-nyanpasu";
  channel: "release";
  buildId: string;
  remotePath: string;
  assets: Record<string, SourceForgeEntry>;
}
interface CatalogOptions {
  fetchMetadata?: (asset: ReleaseAsset) => Promise<unknown>;
}

const sources = [
  {
    id: "nyanpasu",
    label: "Nyanpasu",
    prefix: (tag: string) =>
      `https://nyanpasu-script.majokeiko.com/${repo}/releases/download/${encodeURIComponent(tag)}/`,
  },
  {
    id: "ghfast",
    label: "GHFast",
    prefix: (tag: string) =>
      `https://ghfast.top/https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/`,
  },
  {
    id: "github",
    label: "GitHub",
    prefix: (tag: string) =>
      `https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/`,
  },
] as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateSourceMetadata(value: unknown, tag: string): SourceMetadata {
  if (!value || typeof value !== "object")
    throw new Error("Invalid download-sources.json: expected object");
  const metadata = value as SourceMetadata;
  if (
    metadata.schemaVersion !== 1 ||
    metadata.tag !== tag ||
    !Array.isArray(metadata.sources) ||
    metadata.sources.length !== 3
  )
    throw new Error("Invalid download-sources.json schema or tag");
  const ids = new Set<string>();
  for (const source of metadata.sources) {
    if (
      !source ||
      !["nyanpasu", "github", "ghfast"].includes(source.id) ||
      ids.has(source.id) ||
      typeof source.label !== "string" ||
      !source.label.trim()
    )
      throw new Error("Invalid or duplicate download source");
    ids.add(source.id);
    const expected = sources.find((item) => item.id === source.id)!.prefix(tag);
    if (source.assetUrlPrefix !== expected || source.probeUrl !== `${expected}download-probe.png`)
      throw new Error(`Invalid URL for download source ${source.id}`);
    for (const raw of [source.assetUrlPrefix, source.probeUrl]) {
      const url = new URL(raw);
      if (url.protocol !== "https:" || url.username || url.password || url.port)
        throw new Error("Download source URLs must be safe HTTPS URLs");
    }
  }
  if (ids.size !== 3)
    throw new Error("download-sources.json must list all three configured sources");
  return metadata;
}

function parseAsset(
  asset: ReleaseAsset,
  version: string,
): Omit<DownloadAsset, "urls" | "sha256"> | undefined {
  if (
    asset.state !== "uploaded" ||
    asset.size <= 0 ||
    /(?:updater|\.sig$|\.sha256$|\.tar\.gz$|source(?:code)?)/i.test(asset.name)
  )
    return;
  const v = escapeRegex(version);
  const name = asset.name;
  let m: RegExpExecArray | null;
  if (
    (m = new RegExp(
      `^Clash\\.Nyanpasu_${v}_(x86_64|aarch64)(_fixed-webview)?_portable\\.zip$`,
    ).exec(name))
  ) {
    return {
      id: name,
      name,
      os: "windows",
      arch: m[1] === "x86_64" ? "x64" : "arm64",
      format: "zip",
      ...(m[2] ? { variant: "fixed-webview" as const } : {}),
      size: asset.size,
    };
  }
  if ((m = new RegExp(`^Clash\\.Nyanpasu_${v}_(x64|arm64)-setup\\.exe$`).exec(name)))
    return {
      id: name,
      name,
      os: "windows",
      arch: m[1] === "arm64" ? "arm64" : "x64",
      format: "exe",
      size: asset.size,
    };
  if ((m = new RegExp(`^Clash\\.Nyanpasu_${v}_fixed-webview-(x64|arm64)-setup\\.exe$`).exec(name)))
    return {
      id: name,
      name,
      os: "windows",
      arch: m[1] === "arm64" ? "arm64" : "x64",
      format: "exe",
      variant: "fixed-webview",
      size: asset.size,
    };
  if ((m = new RegExp(`^Clash\\.Nyanpasu_${v}_(x64|aarch64)\\.dmg$`).exec(name)))
    return {
      id: name,
      name,
      os: "macos",
      arch: m[1] === "x64" ? "x64" : "arm64",
      format: "dmg",
      size: asset.size,
    };
  if ((m = new RegExp(`^Clash\\.Nyanpasu_${v}_(amd64|arm64)\\.(deb|AppImage)$`).exec(name)))
    return {
      id: name,
      name,
      os: "linux",
      arch: m[1] === "arm64" ? "arm64" : "x64",
      format: m[2] === "AppImage" ? "appimage" : "deb",
      size: asset.size,
    };
  // Cargo RPM names encode prereleases as 0.rc.N / 0.beta.N / 0.alpha.N.
  const versionMatch = versionPattern.exec(version);
  if (versionMatch) {
    const rpmVersion = `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}-${versionMatch[4] ? `0.${versionMatch[4]}.${versionMatch[5]}` : "1"}`;
    m = new RegExp(`^Clash\\.Nyanpasu-${escapeRegex(rpmVersion)}\\.(x86_64|aarch64)\\.rpm$`).exec(
      name,
    );
    if (m)
      return {
        id: name,
        name,
        os: "linux",
        arch: m[1] === "aarch64" ? "arm64" : "x64",
        format: "rpm",
        size: asset.size,
      };
  }
  return;
}

function expectedGithubUrl(tag: string, name: string) {
  return `https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`;
}

function validateSourceForgeEntry(
  entry: SourceForgeEntry,
  name: string,
  tag: string,
  size: number,
  digest?: string,
) {
  let url: URL;
  try {
    url = new URL(entry.url);
  } catch {
    throw new Error(`Invalid SourceForge URL for ${name}`);
  }
  const expectedPath = `/project/clash-nyanpasu/releases/${tag}/${encodeURIComponent(name)}`;
  const expectedUrl = `https://downloads.sourceforge.net${expectedPath}`;
  if (
    !Number.isSafeInteger(entry.fileSize) ||
    entry.fileSize !== size ||
    !/^[a-f\d]{64}$/i.test(entry.sha256) ||
    (digest && entry.sha256.toLowerCase() !== digest) ||
    url.protocol !== "https:" ||
    url.hostname !== "downloads.sourceforge.net" ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    url.pathname !== expectedPath ||
    entry.url !== expectedUrl
  ) {
    throw new Error(`SourceForge asset identity mismatch for ${name}`);
  }
  return url.href;
}

function validateBrowserDownloadUrl(asset: ReleaseAsset, tag: string) {
  if (!asset.browser_download_url) return expectedGithubUrl(tag, asset.name);
  const url = new URL(asset.browser_download_url);
  if (
    url.href !== expectedGithubUrl(tag, asset.name) ||
    asset.browser_download_url !== expectedGithubUrl(tag, asset.name)
  )
    throw new Error(`Invalid GitHub download URL for ${asset.name}`);
  return url.href;
}

export async function buildDownloadCatalog(
  release: Release,
  options: CatalogOptions = {},
): Promise<DownloadCatalog> {
  const tag = release.tag_name;
  const version = tag.replace(/^v/, "");
  const sourceAssets = release.assets.filter((asset) => asset.name === "download-sources.json");
  const sfAssets = release.assets.filter((asset) => asset.name === "sourceforge-mirrors.json");
  if (sourceAssets.length > 1 || sfAssets.length > 1)
    throw new Error("Duplicate release metadata asset");
  const sourceMetadata = sourceAssets.length
    ? validateSourceMetadata(await options.fetchMetadata?.(sourceAssets[0]), tag)
    : undefined;
  const mirror = sfAssets.length
    ? ((await options.fetchMetadata?.(sfAssets[0])) as SourceForgeManifest)
    : undefined;
  if (
    sfAssets.length &&
    (!mirror ||
      mirror.schemaVersion !== 1 ||
      mirror.project !== "clash-nyanpasu" ||
      mirror.channel !== "release" ||
      mirror.buildId !== tag ||
      mirror.remotePath !== `releases/${tag}` ||
      !mirror.assets ||
      typeof mirror.assets !== "object" ||
      Array.isArray(mirror.assets))
  )
    throw new Error("Invalid sourceforge-mirrors.json schema, channel, or build identity");
  if (mirror) {
    for (const [name, entry] of Object.entries(mirror.assets)) {
      if (!name || !entry || typeof entry !== "object")
        throw new Error("Invalid SourceForge asset entry");
      validateSourceForgeEntry(entry, name, tag, entry.fileSize);
    }
  }
  const assets: DownloadAsset[] = [];
  const ids = new Set<string>();
  const sourceforgeProbeAsset = release.assets.find(
    (asset) => asset.name === "download-probe.png" && asset.state === "uploaded" && asset.size > 0,
  );
  let sourceforgeProbeUrl: string | undefined;
  for (const githubAsset of release.assets) {
    if (
      ["download-sources.json", "sourceforge-mirrors.json", "download-probe.png"].includes(
        githubAsset.name,
      )
    )
      continue;
    const parsed = parseAsset(githubAsset, version);
    if (!parsed) continue;
    if (ids.has(parsed.id)) throw new Error(`Duplicate download asset ${parsed.id}`);
    ids.add(parsed.id);
    const githubUrl = validateBrowserDownloadUrl(githubAsset, tag);
    const urls: Partial<Record<DownloadSourceId, string>> = {};
    for (const source of sourceMetadata?.sources ?? sources) {
      const filename = encodeURIComponent(parsed.name);
      urls[source.id] =
        `${"assetUrlPrefix" in source ? source.assetUrlPrefix : source.prefix(tag)}${filename}`;
    }
    const digest = githubAsset.digest?.match(/^sha256:([a-f\d]{64})$/i)?.[1].toLowerCase();
    urls.github = githubUrl;
    let sourceforgeDigest: string | undefined;
    if (mirror) {
      const spacedName = parsed.name.replace(/^Clash\.Nyanpasu/, "Clash Nyanpasu");
      const mappedName = [parsed.name, spacedName, spacedName.replace(/ /g, ".")].find((name) =>
        Object.hasOwn(mirror.assets, name),
      );
      const entry = mappedName ? mirror.assets[mappedName] : undefined;
      if (entry && mappedName) {
        urls.sourceforge = validateSourceForgeEntry(entry, mappedName, tag, parsed.size, digest);
        sourceforgeDigest = entry.sha256.toLowerCase();
      }
    }
    assets.push({
      ...parsed,
      ...(digest || sourceforgeDigest ? { sha256: digest ?? sourceforgeDigest } : {}),
      urls,
    });
  }
  if (mirror && sourceforgeProbeAsset) {
    const probe = mirror.assets["download-probe.png"];
    if (probe) {
      const digest = sourceforgeProbeAsset.digest
        ?.match(/^sha256:([a-f\d]{64})$/i)?.[1]
        .toLowerCase();
      sourceforgeProbeUrl = validateSourceForgeEntry(
        probe,
        "download-probe.png",
        tag,
        sourceforgeProbeAsset.size,
        digest,
      );
    }
  }
  if (!assets.length) throw new Error(`Release ${tag} contains no recognized download assets`);
  const catalogSources: DownloadCatalog["sources"] = sourceMetadata
    ? sourceMetadata.sources.map(({ id, label, probeUrl }) => ({
        id,
        label,
        ...(sourceforgeProbeAsset ? { probeUrl } : {}),
      }))
    : sources.map(({ id, label }) => ({ id, label }));
  if (assets.some((asset) => asset.urls.sourceforge)) {
    catalogSources.splice(1, 0, {
      id: "sourceforge",
      label: "SourceForge",
      ...(sourceforgeProbeUrl ? { probeUrl: sourceforgeProbeUrl } : {}),
    });
  }
  return {
    version,
    tag,
    channel: /-(alpha|beta|rc)\./.exec(tag)?.[1] ?? "stable",
    releaseUrl: `https://github.com/${repo}/releases/tag/${encodeURIComponent(tag)}`,
    publishedAt: release.published_at ?? "",
    sources: catalogSources,
    assets,
  };
}
