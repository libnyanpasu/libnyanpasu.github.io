<script setup lang="ts">
// import 'uno.css'

import { inBrowser, useData } from 'vitepress'
import { useTheme } from 'vuetify'

const theme = useTheme()
const { isDark, lang } = useData()

// 切换 夜间 / 日间 模式
function enableTransitions() {
  return (
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    theme.global.name.value = isDark.value ? 'dark' : 'light'
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )

  theme.global.name.value = isDark.value ? 'dark' : 'light'
})

// 检测浏览器语言，并持久化默认语言
watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`
  }
})
onMounted(() => {
  if (inBrowser) {
    if (document.cookie.includes('nf_lang=')) {
      return
    }
    const userLanguage = navigator.language
    switch (userLanguage) {
      case 'zh-CN':
        lang.value = 'zh-CN'
        break
      default:
        lang.value = 'en'
        break
    }
  }
})
</script>

<template>
  <!-- <DefaultTheme.Layout>
    <template #layout-bottom>
      <BackToTop />
      <UnoCSSIndicator />
    </template>

    <template #home-features-after>
      <ListReleases />
    </template>
  </DefaultTheme.Layout> -->
  <MDYLayout />
</template>

<style lang="scss">
::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: none;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
