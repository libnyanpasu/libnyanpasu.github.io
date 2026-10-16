import { writeFile, rename } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = "libnyanpasu/clash-nyanpasu";
export interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  prerelease?: boolean;
  assets: { name: string; state: string; size: number }[];
}

interface SyncOptions {
  tag?: string;
  token?: string;
  output?: string | URL;
}
const tagPattern =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.(0|[1-9]\d*))?$/;
const packages = [
  "_x64-setup.exe",
  "_arm64-setup.exe",
  "_amd64.deb",
  "_arm64.deb",
  "_x64.dmg",
  "_aarch64.dmg",
];

function version(release: GitHubRelease) {
  const match = tagPattern.exec(release.tag_name);
  const channel = match?.[4] || "stable";
  return (
    match && [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      channel === "alpha" ? 0 : channel === "beta" ? 1 : channel === "rc" ? 2 : 3,
      Number(match[5] || 0),
    ]
  );
}

export function compareReleases(left: GitHubRelease, right: GitHubRelease) {
  const a = version(left);
  const b = version(right);
  if (!a || !b) throw new Error("Cannot compare unsupported release tags");
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return b[i] - a[i];
  }
  return 0;
}

export function isCompleteRelease(release: GitHubRelease) {
  if (release.draft || !version(release)) return false;
  const assets = release.assets.filter((asset) => asset.state === "uploaded" && asset.size > 0);
  return packages.every((suffix) =>
    assets.some(
      (asset) => asset.name === `Clash.Nyanpasu_${release.tag_name.replace(/^v/, "")}${suffix}`,
    ),
  );
}

export function releaseSnapshot(release: GitHubRelease) {
  const match = tagPattern.exec(release.tag_name);
  if (!match) throw new Error(`Unsupported release tag: ${release.tag_name}`);
  return {
    version: release.tag_name.replace(/^v/, ""),
    href: `https://github.com/${repository}/releases/tag/${release.tag_name}`,
    channel: match[4] || "stable",
  };
}

async function github<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`GitHub ${path}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function syncHomeRelease({
  tag = "",
  token = "",
  output = new URL("../src/data/release.generated.json", import.meta.url),
}: SyncOptions = {}) {
  const releases: GitHubRelease[] = [];
  // An explicit notification must refer to a complete release. Fail the build
  // rather than deploy stale data when the source release is unavailable.
  if (tag) {
    if (!tagPattern.test(tag)) throw new Error(`Unsupported release tag: ${tag}`);
    const requested = await github<GitHubRelease>(
      `releases/tags/${encodeURIComponent(tag)}`,
      token,
    );
    if (!isCompleteRelease(requested))
      throw new Error(`Release ${tag} is missing platform packages`);
    releases.push(requested);
  }

  for (let page = 1; ; page++) {
    const batch = await github<GitHubRelease[]>(`releases?per_page=100&page=${page}`, token);
    releases.push(...batch);
    if (batch.length < 100) break;
  }
  // Do not let a delayed notification or a rebuild of an older tag downgrade
  // the homepage. GitHub's prerelease flag does not reflect this project's RCs.
  const release = releases.filter(isCompleteRelease).sort(compareReleases)[0];
  if (!release) throw new Error("No complete versioned release found");
  const snapshot = releaseSnapshot(release);
  const temporary = `${output instanceof URL ? fileURLToPath(output) : output}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, output);
  console.log(`Homepage release: ${snapshot.version} (${snapshot.channel})`);
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await syncHomeRelease({ tag: process.env.RELEASE_TAG, token: process.env.GH_TOKEN });
}
