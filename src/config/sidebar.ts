import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { join, extname, basename } from "node:path";
import type { StarlightUserConfig } from "@astrojs/starlight/types";

type StarlightSidebarItem = NonNullable<StarlightUserConfig["sidebar"]>[number];

const DOCS_ROOT = join(process.cwd(), "src/content/docs");
const DOC_EXTS = new Set([".md", ".mdx"]);
const EXAMPLES_ROOT = join(process.cwd(), "custom-css-example");

function readDirLabel(relDir: string): string | undefined {
  const p = join(DOCS_ROOT, relDir, "_dir.yaml");
  if (!existsSync(p)) return undefined;
  return readFileSync(p, "utf-8").match(/^label:\s*["']?(.+?)["']?\s*$/m)?.[1];
}

function isDirCollapsed(relDir: string): boolean {
  const p = join(DOCS_ROOT, relDir, "_dir.yaml");
  if (!existsSync(p)) return false;
  return /^collapsed:\s*true\s*$/m.test(readFileSync(p, "utf-8"));
}

/**
 * Read the first `# Heading` from a readme file.
 */
function readReadmeTitle(readmePath: string): string | undefined {
  try {
    const md = readFileSync(readmePath, "utf-8");
    const m = md.match(/^#\s+(.+)/m);
    return m ? m[1] : undefined;
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

// Generate .mdx stubs before the sidebar is built
syncCssExamplePages();

/**
 * Dynamically builds sidebar items for a given docs directory.
 * - Files become slug entries (titles auto-translated by Starlight via frontmatter)
 * - Subdirectories become autogenerate groups with labels from _dir.yaml
 *   and zh-cn translations from zh-cn/<dir>/_dir.yaml
 */
function buildDirItems(dir: string): StarlightSidebarItem[] {
  const absPath = join(DOCS_ROOT, dir);
  return readdirSync(absPath)
    .filter((entry) => !entry.startsWith("_") && !entry.startsWith("."))
    .flatMap((entry): StarlightSidebarItem[] => {
      const full = join(absPath, entry);
      if (statSync(full).isDirectory()) {
        const relDir = `${dir}/${entry}`;
        const enLabel = readDirLabel(relDir);
        const zhLabel = readDirLabel(`zh-cn/${relDir}`);
        const collapsed = isDirCollapsed(relDir) || isDirCollapsed(`zh-cn/${relDir}`);
        return [
          {
            label: enLabel ?? entry,
            ...(zhLabel ? { translations: { "zh-CN": zhLabel } } : {}),
            collapsed,
            autogenerate: { directory: relDir },
          },
        ];
      } else if (DOC_EXTS.has(extname(entry))) {
        const name = entry.replace(/\.mdx?$/, "");
        if (name === "index") return [];
        return [{ slug: `${dir}/${name}` }];
      }
      return [];
    });
}

export const sidebar: StarlightSidebarItem[] = [
  "index",
  "introduction",
  {
    label: "Tutorial",
    translations: { "zh-CN": "文档" },
    items: buildDirItems("tutorial"),
  },
  "development",
  {
    label: "Others",
    translations: { "zh-CN": "其他" },
    autogenerate: { directory: "others" },
  },
];
