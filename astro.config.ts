import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sidebar } from "./src/config/sidebar";

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
      sidebar,
      components: {
        Head: "./src/components/overrides/Head.astro",
      },
      lastUpdated: true,
      credits: true,
    }),
    react(),
  ],
  markdown: {
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
