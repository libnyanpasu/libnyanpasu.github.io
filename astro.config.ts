import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

function remarkVitePressContainers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (node.type !== "containerDirective") return;
      const name: string = node.name ?? "";
      const typeMap: Record<string, string> = {
        info: "info",
        tip: "tip",
        warning: "warning",
        danger: "danger",
        details: "details",
        theorem: "theorem",
      };
      if (!typeMap[name]) return;
      node.data = {
        ...node.data,
        hName: name === "details" ? "details" : "div",
        hProperties: { class: `custom-block custom-block-${name}` },
      };
    });
  };
}

export default defineConfig({
  site: "https://libnyanpasu.github.io",
  output: "static",
  integrations: [
    starlight({
      title: "Clash Nyanpasu",
      logo: {
        src: "./src/assets/logo.png",
        alt: "Clash Nyanpasu",
      },
      social: [
        {
          icon: "telegram",
          label: "Telegram",
          href: "https://t.me/keikolog",
        },
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/libnyanpasu",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/libnyanpasu/libnyanpasu.github.io/edit/main/",
      },
      customCss: ["./src/styles/tailwind.css"],
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        "zh-cn": {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      sidebar: [
        "index",
        "introduction",
        {
          label: "Tutorial",
          translations: { "zh-CN": "文档" },
          autogenerate: { directory: "tutorial" },
        },
        "development",
        {
          label: "Others",
          translations: { "zh-CN": "其他" },
          autogenerate: { directory: "others" },
        },
      ],
      components: {
        Head: "./src/components/overrides/Head.astro",
      },
      lastUpdated: true,
      credits: true,
    }),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkDirective, remarkVitePressContainers],
    shikiConfig: { theme: "github-dark" },
  },
  vite: {
    plugins: [
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["url", "baseLocale"],
        urlPatterns: [
          {
            pattern: "/:path(.*)?",
            localized: [
              ["zh-cn", "/zh-cn/:path(.*)?"],
              ["en", "/:path(.*)?"],
            ],
          },
        ],
        emitPrettierIgnore: false,
        includeEslintDisableComment: false,
      }),
    ],
  },
});
