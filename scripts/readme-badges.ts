import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import material from "@iconify-json/material-symbols/icons.json" with { type: "json" };
import logos from "@iconify-json/logos/icons.json" with { type: "json" };
import { getIconData, iconToSVG } from "@iconify/utils";
import { buildSchemes, SEEDS } from "../src/components/home/features/material-schemes.ts";
import { compareReleases, isCompleteRelease, type GitHubRelease } from "./sync-home-release.ts";

const repository = "libnyanpasu/clash-nyanpasu";
const repositoryUrl = `https://github.com/${repository}`;
const seed = SEEDS[0];
const schemes = buildSchemes([seed])[seed];
export const THEMES = ["light", "dark"] as const;
type Theme = (typeof THEMES)[number];
type Tone = "primary" | "secondary" | "tertiary" | "error";

interface BadgeRelease extends GitHubRelease {
  assets: (GitHubRelease["assets"][number] & { download_count: number })[];
}

interface Repository {
  stargazers_count: number;
  default_branch: string;
  license: { spdx_id: string } | null;
}

interface WorkflowRun {
  status: string;
  conclusion: string | null;
  html_url: string;
}

export interface Badge {
  id: string;
  label: string;
  value?: string;
  icon: string;
  href: string;
  tone?: Tone;
}

async function github<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`GitHub ${path}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

async function releases(token: string): Promise<BadgeRelease[]> {
  const result: BadgeRelease[] = [];
  for (let page = 1; ; page++) {
    const batch = await github<BadgeRelease[]>(
      `repos/${repository}/releases?per_page=100&page=${page}`,
      token,
    );
    result.push(...batch);
    if (batch.length < 100) return result;
  }
}

export async function readmeBadges(token = ""): Promise<Badge[]> {
  const [repo, published, issues] = await Promise.all([
    github<Repository>(`repos/${repository}`, token),
    releases(token),
    github<{ total_count: number }>(
      `search/issues?q=${encodeURIComponent(`repo:${repository} is:issue is:open`)}&per_page=1`,
      token,
    ),
  ]);
  // Use the homepage's complete-package and semantic-version rules, including RCs.
  const release = published.filter(isCompleteRelease).sort(compareReleases)[0];
  if (!release) throw new Error("No complete versioned release found for the README badges");
  const { workflow_runs: runs } = await github<{ workflow_runs: WorkflowRun[] }>(
    `repos/${repository}/actions/workflows/ci.yml/runs?per_page=1&event=push&branch=${encodeURIComponent(repo.default_branch)}`,
    token,
  );
  const run = runs[0];
  const conclusion = run?.status === "completed" ? run.conclusion : run?.status;
  const status = conclusion ?? (run ? "unknown" : "no runs");
  const failed = ["failure", "timed_out", "action_required", "startup_failure"].includes(status);
  const downloads = published
    .filter((item) => !item.draft)
    .flatMap((item) => item.assets)
    .reduce((total, asset) => total + asset.download_count, 0);
  const count = (value: number) => value.toLocaleString("en-US");
  return [
    {
      id: "release",
      label: "Release",
      value: release.tag_name,
      icon: "sell-rounded",
      href: `${repositoryUrl}/releases/tag/${encodeURIComponent(release.tag_name)}`,
    },
    {
      id: "build",
      label: "Build",
      value: ({ success: "passing", failure: "failing" }[status] ?? status).replaceAll("_", " "),
      icon: failed
        ? "error-rounded"
        : status === "success"
          ? "check-circle-rounded"
          : "pending-rounded",
      tone: failed ? "error" : status === "success" ? "primary" : "secondary",
      href: run?.html_url ?? `${repositoryUrl}/actions/workflows/ci.yml`,
    },
    {
      id: "stars",
      label: "Stars",
      value: count(repo.stargazers_count),
      icon: "star-rounded",
      href: `${repositoryUrl}/stargazers`,
    },
    {
      id: "downloads",
      label: "Downloads",
      value: count(downloads),
      icon: "download-rounded",
      href: `${repositoryUrl}/releases`,
    },
    {
      id: "license",
      label: "License",
      value: repo.license?.spdx_id ?? "not specified",
      icon: "license-rounded",
      tone: "tertiary",
      href: `${repositoryUrl}/blob/main/LICENSE`,
    },
    {
      id: "issues",
      label: "Issues",
      value: count(issues.total_count),
      icon: "bug-report-rounded",
      tone: "secondary",
      href: `${repositoryUrl}/issues`,
    },
    {
      id: "follow",
      label: "Follow @ClashNyanpasu",
      icon: "x",
      tone: "secondary",
      href: "https://x.com/ClashNyanpasu",
    },
    { id: "docs", label: "Documentation", icon: "menu-book-rounded", href: "https://nyanpasu.org" },
    {
      id: "telegram-channel",
      label: "Telegram Channel",
      icon: "campaign-rounded",
      href: "https://t.me/ClashNyanpasu",
    },
    {
      id: "telegram-group",
      label: "Telegram Group",
      icon: "forum-rounded",
      href: "https://t.me/+IGNnkH5k7WE3MzA1",
    },
    {
      id: "deepwiki",
      label: "Ask DeepWiki",
      icon: "auto-stories-rounded",
      tone: "secondary",
      href: `https://deepwiki.com/${repository}`,
    },
  ];
}

function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
}

function textWidth(text: string) {
  return Math.ceil(
    [...text].reduce(
      (width, char) => width + ("ilI.,:;!|' ".includes(char) ? 4 : "MW@%".includes(char) ? 12 : 8),
      0,
    ),
  );
}

function iconSvg(name: string) {
  const icon = getIconData(name === "x" ? logos : material, name);
  if (!icon) throw new Error(`Unknown badge icon: ${name}`);
  const svg = iconToSVG(icon, { width: 20, height: 20 });
  return `<svg x="12" y="6" width="20" height="20" viewBox="${svg.attributes.viewBox}" fill="currentColor">${svg.body}</svg>`;
}

export function renderBadge(badge: Badge, theme: Theme) {
  const scheme = schemes[theme];
  const tone = badge.tone ?? "primary";
  const background = scheme[`--md-sys-color-${tone}-container`];
  const foreground = scheme[`--md-sys-color-on-${tone}-container`];
  const valueBackground = scheme[`--md-sys-color-${tone}`];
  const valueForeground = scheme[`--md-sys-color-on-${tone}`];
  const labelWidth = textWidth(badge.label);
  const valueWidth = badge.value ? textWidth(badge.value) : 0;
  const valueX = 42 + labelWidth + 10;
  const width = badge.value ? valueX + valueWidth + 24 : 42 + labelWidth + 14;
  const title = escape(badge.value ? `${badge.label}: ${badge.value}` : badge.label);
  const text = (x: number, value: string, length: number, fill: string) =>
    `<text x="${x}" y="21" fill="${fill}" textLength="${length}" lengthAdjust="spacingAndGlyphs">${escape(value)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="32" viewBox="0 0 ${width} 32" role="img" aria-label="${title}" color="${foreground}">
<title>${title}</title>
<rect width="${width}" height="32" rx="16" fill="${background}"/>
${iconSvg(badge.icon)}
<g font-family="Inter,Roboto,Arial,sans-serif" font-size="14" font-weight="600">
${text(42, badge.label, labelWidth, foreground)}
${badge.value ? `<rect x="${valueX}" y="4" width="${valueWidth + 20}" height="24" rx="12" fill="${valueBackground}"/>\n${text(valueX + 10, badge.value, valueWidth, valueForeground)}` : ""}
</g>
</svg>\n`;
}

export function renderGallery(badges: Badge[]) {
  const sections = THEMES.map(
    (theme) => `<section class="${theme}"><h2>${theme === "light" ? "Light" : "Dark"}</h2>
<div class="row">${badges.map((badge) => `<a href="${escape(badge.href)}"><img src="./${badge.id}-${theme}.svg" alt="${escape(badge.label)}" height="32"></a>`).join("\n")}</div></section>`,
  );
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clash Nyanpasu · README badges</title>
<style>body{margin:0;background:#121316;font:16px system-ui,sans-serif}main{max-width:1120px;margin:64px auto;padding:0 24px}h1{color:#e3e2e6;font-size:28px;font-weight:500}section{border-radius:28px;padding:32px;margin:24px 0}h2{margin:0 0 24px;font-size:14px;text-transform:uppercase;letter-spacing:.1em;font-weight:500}.light{background:${schemes.light["--md-sys-color-surface"]};color:${schemes.light["--md-sys-color-on-surface"]}}.dark{background:${schemes.dark["--md-sys-color-surface-container"]};color:${schemes.dark["--md-sys-color-on-surface"]}}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}a{display:inline-flex;border-radius:16px}a:focus-visible{outline:3px solid #acc7ff;outline-offset:4px}img{display:block;max-width:100%;height:auto}</style>
</head><body><main><h1>Clash Nyanpasu · README badges</h1>${sections.join("\n")}</main></body></html>\n`;
}

export async function generateReadmeBadges({
  token = "",
  output = new URL("../dist/readme/badges/", import.meta.url),
}: { token?: string; output?: URL } = {}) {
  // Collect and render everything before replacing files: an API failure must not publish zeros.
  const badges = await readmeBadges(token);
  const files = THEMES.flatMap((theme) =>
    badges.map((badge) => ({
      name: `${badge.id}-${theme}.svg`,
      body: renderBadge(badge, theme),
    })),
  );
  files.push({ name: "index.html", body: renderGallery(badges) });
  await mkdir(output, { recursive: true });
  await Promise.all(files.map(({ name, body }) => writeFile(new URL(name, output), body)));
  console.log(`Generated ${badges.length} README badges in light and dark themes`);
  return badges;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateReadmeBadges({ token: process.env.GH_TOKEN });
}
