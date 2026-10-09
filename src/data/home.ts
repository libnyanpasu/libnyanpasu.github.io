/** Update this when a new release is published. Keep the visible channel explicit. */
export const homeRelease = {
  version: "2.0.0-rc.1",
  href: "https://github.com/libnyanpasu/clash-nyanpasu/releases/tag/v2.0.0-rc.1",
  channel: "rc",
} as const;

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
