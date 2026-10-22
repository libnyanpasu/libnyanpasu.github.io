# README badges

`pnpm readme:badges` reads public GitHub statistics and generates standalone
Material You SVGs in `dist/readme/badges/`, together with an `index.html` preview.
It uses the homepage's theme generator, existing Iconify icons, and release
selection rules. No separate badge service is required.

The command also runs at the end of `pnpm build`. Badges refresh when the existing
Pages workflow builds the site: on a main-branch push, release notification,
manual run, or daily schedule. They are build-time snapshots, not live counters.
Set `GH_TOKEN` for authenticated GitHub requests; CI supplies its existing token.
API failures fail generation instead of replacing statistics with zeros.

```sh
pnpm readme:badges
pnpm test:badges
pnpm preview
```

Open `/readme/badges/` in the local preview server. Published image URLs follow
`https://nyanpasu.org/readme/badges/<name>-<theme>.svg`, where the theme is `light`
or `dark` and the name is one of:

- `release`: newest complete versioned release, including RCs, matching the homepage.
- `build`: latest push build on the default branch, using the `ci.yml` workflow.
- `stars`: repository stars.
- `downloads`: all asset downloads across published releases, including rolling releases.
- `license`: the repository's SPDX license identifier.
- `issues`: open issues, excluding pull requests.
- `follow`: follow `@ClashNyanpasu` on X; no follower count is fetched.
- `docs`: official documentation at `https://nyanpasu.org`.
- `telegram-channel`: announcements at `https://t.me/ClashNyanpasu`.
- `telegram-group`: discussion at `https://t.me/+IGNnkH5k7WE3MzA1`.
- `deepwiki`: the project's DeepWiki page.

Use a `<picture>` inside a link in the client README. The dark SVG is selected
for dark mode, with the light SVG as the fallback. Deploy the website before
publishing README links to the new URLs.

```html
<a href="https://nyanpasu.org">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://nyanpasu.org/readme/badges/docs-dark.svg"
    />
    <img src="https://nyanpasu.org/readme/badges/docs-light.svg" alt="Documentation" height="32" />
  </picture>
</a>
```
