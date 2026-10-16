import release from "./release.generated.json";

export const homeRelease = release;

export const repositoryUrl = "https://github.com/libnyanpasu/clash-nyanpasu";

export interface HomeBlogPost {
  locale: "en" | "zh-cn";
  title: string;
  description: string;
  href: string;
  publishedAt: string;
  cover?: string;
  coverAlt?: string;
}

/** Replace with the published blog collection when the blog is introduced. */
export const homeBlogPosts: HomeBlogPost[] = [];
