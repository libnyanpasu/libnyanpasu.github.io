// port from https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/composables/langs.ts
import { useData } from 'vitepress'

function ensureStartingSlash(path: string): string {
  return /^\//.test(path) ? path : `/${path}`
}

function normalizeLink(
  link: string,
  addPath: boolean,
  path: string,
  addExt: boolean
) {
  return addPath
    ? link.replace(/\/$/, '') +
        ensureStartingSlash(
          path
            .replace(/(^|\/)index\.md$/, '$1')
            .replace(/\.md$/, addExt ? '.html' : '')
        )
    : link
}

export function useLangs() {
  const { site, localeIndex, page, theme, hash } = useData()

  const currentLang = computed(() => ({
    index: localeIndex.value,
    label: site.value.locales[localeIndex.value]?.label,
    link:
      site.value.locales[localeIndex.value]?.link ||
      (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`)
  }))

  const localeLinks = computed(() =>
    Object.entries(site.value.locales).map(([key, value]) => ({
      index: key,
      text: value.label,
      link:
        normalizeLink(
          value.link || (key === 'root' ? '/' : `/${key}/`),
          theme.value.i18nRouting !== false,
          page.value.relativePath.slice(currentLang.value.link.length - 1),
          !site.value.cleanUrls
        ) + hash.value
    }))
  )

  return { localeLinks, currentLang }
}
