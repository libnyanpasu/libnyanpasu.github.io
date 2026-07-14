import {
  readFileSync,
  existsSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { join, extname } from "node:path";
import type { StarlightUserConfig } from "@astrojs/starlight/types";

type StarlightSidebarItem = NonNullable<StarlightUserConfig["sidebar"]>[number];

export interface NavItem {
  text: string;
  link: string;
}

export interface SidebarGroup {
  text: string;
  items: NavItem[];
}

export type SidebarEntry = NavItem | SidebarGroup;

const DOCS_ROOT = join(process.cwd(), "src/content/docs");
const DOC_EXTS = new Set([".md", ".mdx"]);
const EXAMPLES_ROOT = join(process.cwd(), "custom-css-example");
const CHAINS_ROOT = join(process.cwd(), "chains");
const DEFAULT_ORDER = Number.MAX_SAFE_INTEGER;

interface SidebarMetadata {
  label?: string;
  order?: number;
  collapsed?: boolean;
}

function readDirMetadata(relDir: string): SidebarMetadata {
  const p = join(DOCS_ROOT, relDir, "_dir.yaml");
  if (!existsSync(p)) return {};

  const source = readFileSync(p, "utf-8");
  const order = source.match(/^order:\s*(-?\d+(?:\.\d+)?)\s*$/m)?.[1];

  return {
    label: source.match(/^label:\s*["']?(.+?)["']?\s*$/m)?.[1],
    order: order === undefined ? undefined : Number(order),
    collapsed: /^collapsed:\s*true\s*$/m.test(source),
  };
}

function readPageOrder(pagePath: string): number | undefined {
  const source = readFileSync(pagePath, "utf-8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/m)?.[1];
  const sidebar = frontmatter?.match(/^sidebar:\s*\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m)?.[1];
  const order = sidebar?.match(/^\s+order:\s*(-?\d+(?:\.\d+)?)\s*$/m)?.[1];
  return order === undefined ? undefined : Number(order);
}

function humanizeDirectoryName(name: string): string {
  const value = name.replace(/[-_]+/g, " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Resolve a readme's title, preferring YAML frontmatter `title:` and
 * falling back to the first `# Heading` for backwards compatibility.
 */
function readReadmeTitle(readmePath: string): string | undefined {
  try {
    const md = readFileSync(readmePath, "utf-8");
    const frontmatter = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (frontmatter) {
      const title = frontmatter[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (title) return title[1];
    }
    const heading = md.match(/^#\s+(.+)/m);
    return heading ? heading[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Synchronize auto-generated .mdx pages for each example in `custom-css-example/`.
 * Called at config-load time so the content collection sees the generated files.
 */
function syncCssExamplePages() {
  const enDir = join(DOCS_ROOT, "tutorial", "custom-css-example");
  const zhDir = join(DOCS_ROOT, "zh-cn", "tutorial", "custom-css-example");

  // Ensure content directories exist
  mkdirSync(enDir, { recursive: true });
  mkdirSync(zhDir, { recursive: true });

  // Discover example directories
  const exampleNames: string[] = [];
  if (existsSync(EXAMPLES_ROOT)) {
    for (const entry of readdirSync(EXAMPLES_ROOT, { withFileTypes: true })) {
      if (entry.isDirectory()) exampleNames.push(entry.name);
    }
  }

  // Write _dir.yaml if missing
  for (const dir of [enDir, zhDir]) {
    const yamlPath = join(dir, "_dir.yaml");
    if (!existsSync(yamlPath)) {
      writeFileSync(yamlPath, "");
    }
  }

  // Track generated files to clean up stale ones
  const generated = new Set<string>();

  for (const name of exampleNames) {
    const enFile = join(enDir, `${name}.mdx`);
    const zhFile = join(zhDir, `${name}.mdx`);
    generated.add(enFile);
    generated.add(zhFile);

    // English
    const enTitle = readReadmeTitle(join(EXAMPLES_ROOT, name, "readme.md")) ?? name;
    const enContent = [
      "---",
      `title: "${enTitle.replace(/"/g, '\\"')}"`,
      "---",
      "",
      'import CssExamplePage from "@/components/docs/css-example-page.astro";',
      "",
      `<CssExamplePage dir="custom-css-example/${name}" />`,
      "",
    ].join("\n");
    writeFileSync(enFile, enContent);

    // Chinese
    const zhTitle =
      readReadmeTitle(join(EXAMPLES_ROOT, name, "readme.zh-cn.md")) ??
      readReadmeTitle(join(EXAMPLES_ROOT, name, "readme.md")) ??
      name;
    const zhContent = [
      "---",
      `title: "${zhTitle.replace(/"/g, '\\"')}"`,
      "---",
      "",
      'import CssExamplePage from "@/components/docs/css-example-page.astro";',
      "",
      `<CssExamplePage dir="custom-css-example/${name}" lang="zh-cn" />`,
      "",
    ].join("\n");
    writeFileSync(zhFile, zhContent);
  }

  // Clean up stale generated files (those not matching any example directory)
  for (const dir of [enDir, zhDir]) {
    for (const entry of readdirSync(dir)) {
      if (!DOC_EXTS.has(extname(entry))) continue;
      const name = entry.replace(/\.mdx?$/, "");
      if (name === "index") continue;
      const fullPath = join(dir, entry);
      if (!generated.has(fullPath)) {
        unlinkSync(fullPath);
      }
    }
  }
}

/**
 * Synchronize auto-generated .mdx pages for each chain example in `chains/`.
 */
function syncChainExamplePages() {
  const enDir = join(DOCS_ROOT, "tutorial", "chains");
  const zhDir = join(DOCS_ROOT, "zh-cn", "tutorial", "chains");

  mkdirSync(enDir, { recursive: true });
  mkdirSync(zhDir, { recursive: true });

  const exampleNames: string[] = [];
  if (existsSync(CHAINS_ROOT)) {
    for (const entry of readdirSync(CHAINS_ROOT, { withFileTypes: true })) {
      if (entry.isDirectory()) exampleNames.push(entry.name);
    }
  }

  const generated = new Set<string>();

  for (const name of exampleNames) {
    const enFile = join(enDir, `${name}.mdx`);
    const zhFile = join(zhDir, `${name}.mdx`);
    generated.add(enFile);
    generated.add(zhFile);

    // English
    const enTitle = readReadmeTitle(join(CHAINS_ROOT, name, "readme.md")) ?? name;
    const enContent = [
      "---",
      `title: "${enTitle.replace(/"/g, '\\"')}"`,
      "---",
      "",
      'import ChainExamplePage from "@/components/docs/chain-example-page.astro";',
      "",
      `<ChainExamplePage dir="chains/${name}" />`,
      "",
    ].join("\n");
    writeFileSync(enFile, enContent);

    // Chinese
    const zhTitle =
      readReadmeTitle(join(CHAINS_ROOT, name, "readme.zh-cn.md")) ??
      readReadmeTitle(join(CHAINS_ROOT, name, "readme.md")) ??
      name;
    const zhContent = [
      "---",
      `title: "${zhTitle.replace(/"/g, '\\"')}"`,
      "---",
      "",
      'import ChainExamplePage from "@/components/docs/chain-example-page.astro";',
      "",
      `<ChainExamplePage dir="chains/${name}" lang="zh-cn" />`,
      "",
    ].join("\n");
    writeFileSync(zhFile, zhContent);
  }

  // Clean up stale generated files
  for (const dir of [enDir, zhDir]) {
    for (const entry of readdirSync(dir)) {
      if (!DOC_EXTS.has(extname(entry))) continue;
      const name = entry.replace(/\.mdx?$/, "");
      if (name === "index") continue;
      const fullPath = join(dir, entry);
      if (!generated.has(fullPath)) {
        unlinkSync(fullPath);
      }
    }
  }
}

// Generate .mdx stubs before the sidebar is built
syncCssExamplePages();
syncChainExamplePages();

/** Build the complete sidebar recursively from the docs directory. */
function buildDirItems(dir: string): StarlightSidebarItem[] {
  const absPath = join(DOCS_ROOT, dir);
  const entries = readdirSync(absPath, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .filter((entry) => !(dir === "" && entry.isDirectory() && entry.name === "zh-cn"))
    .flatMap((entry): { item: StarlightSidebarItem; order: number; key: string }[] => {
      const fullPath = join(absPath, entry.name);

      if (entry.isDirectory()) {
        const relDir = dir ? `${dir}/${entry.name}` : entry.name;
        const items = buildDirItems(relDir);
        if (items.length === 0) return [];

        const metadata = readDirMetadata(relDir);
        const localizedMetadata = readDirMetadata(`zh-cn/${relDir}`);

        return [
          {
            item: {
              label: metadata.label ?? humanizeDirectoryName(entry.name),
              ...(localizedMetadata.label
                ? { translations: { "zh-CN": localizedMetadata.label } }
                : {}),
              collapsed: metadata.collapsed || localizedMetadata.collapsed,
              items,
            },
            order: metadata.order ?? DEFAULT_ORDER,
            key: relDir,
          },
        ];
      }

      if (!DOC_EXTS.has(extname(entry.name))) return [];

      const name = entry.name.replace(/\.mdx?$/, "");
      const slug = dir ? `${dir}/${name}` : name;
      return [
        {
          item: { slug },
          order: readPageOrder(fullPath) ?? DEFAULT_ORDER,
          key: slug,
        },
      ];
    });

  return entries
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key, "en"))
    .map(({ item }) => item);
}

export const sidebar: StarlightSidebarItem[] = buildDirItems("");
