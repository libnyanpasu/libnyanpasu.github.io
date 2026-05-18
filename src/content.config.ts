import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      exclude: ["**/custom-css-example/**/readme.md"],
    }),
    schema: docsSchema(),
  }),
};
