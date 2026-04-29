import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { SidebarItem } from "@astrojs/starlight/schemas/sidebar";

function readDirLabel(dir: string): string | undefined {
  const p = join(process.cwd(), "src/content/docs", dir, "_dir.yaml");
  if (!existsSync(p)) return undefined;
  const raw = readFileSync(p, "utf-8");
  return raw.match(/^label:\s*["']?(.+?)["']?\s*$/m)?.[1];
}

export const sidebar: SidebarItem[] = [
  "index",
  "introduction",
  {
    label: "Tutorial",
    translations: { "zh-CN": "文档" },
    items: [
      { slug: "tutorial/install" },
      { slug: "tutorial/proxy-chain" },
      {
        label: readDirLabel("tutorial/chains") ?? "chains",
        translations: {
          "zh-CN": readDirLabel("zh-cn/tutorial/chains") ?? "chains",
        },
        collapsed: true,
        autogenerate: { directory: "tutorial/chains" },
      },
    ],
  },
  "development",
  {
    label: "Others",
    translations: { "zh-CN": "其他" },
    autogenerate: { directory: "others" },
  },
];
