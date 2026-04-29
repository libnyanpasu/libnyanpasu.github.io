export default {
  "**/*.{ts,tsx,js,jsx,astro,css,json,md,mdx}": ["oxfmt --write"],
  "**/*.{ts,tsx,js,jsx}": ["oxlint"],
};
