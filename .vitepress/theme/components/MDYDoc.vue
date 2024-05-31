<template>
  <div class="MDYDoc-container">
    <Content class="MDYDoc-Content" />
    <div v-if="!(xs || sm) && !page.isNotFound" class="aside">
      <VCard class="aside-fixed" rounded="xl">
        <VCardTitle class="px-6 pt-4 font-bold text-lg">
          {{ resolveTitle(theme) }}
        </VCardTitle>
        <VCardText>
          <VList>
            <VListItem
              v-for="item in headers"
              class="mt-1 mb-1"
              rounded="xl"
              density="compact"
              :variant="selected === item.link ? 'tonal' : 'text'"
              :href="item.link"
              @click="scrollIntoView(item.link)"
            >
              <VListItemTitle class="text-base px-2">
                {{ item.title }}
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getScrollOffset, onContentUpdated, useData } from 'vitepress'
import { useDisplay } from 'vuetify'
import { getMainSection, useMainSectionOnScroll } from '../hooks'
import { getHeaders, resolveTitle, type MenuItem } from '../utils/docs'
import { getAbsoluteTop } from '../utils/sidetools'

const { sm, xs } = useDisplay()

const { frontmatter, theme, hash, page } = useData()

const headers = shallowRef<MenuItem[]>([])

const selected = ref<string | null>(hash.value)

const scrollIntoView = (link: string, options?: ScrollIntoViewOptions) => {
  const id = link.split('#')[1]

  const heading = document.getElementById(decodeURIComponent(id))

  heading?.scrollIntoView(options)
}

const setSelected = () => {
  const { y, arrivedState } = useScroll(getMainSection())

  const scrollY = y.value - getMainSection()!.clientHeight / 2 - 96
  const isBottom = arrivedState.bottom

  const header = headers.value
    .map(({ element, link }) => ({
      link,
      top: getAbsoluteTop(element)
    }))
    .filter(({ top }) => !Number.isNaN(top))
    .sort((a, b) => a.top - b.top)

  if (!header.length || scrollY < 1) {
    selected.value = null
  } else if (isBottom) {
    selected.value = header[header.length - 1].link
  } else {
    const activeHeader = header.find(
      ({ top }) => top > scrollY + getScrollOffset() + 4
    )

    selected.value = activeHeader ? activeHeader.link : null
  }
}

onContentUpdated(() => {
  headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)

  if (hash.value) {
    scrollIntoView(hash.value, { behavior: 'smooth' })
  }
})

onMounted(() => {
  useMainSectionOnScroll(
    useThrottleFn(() => {
      setSelected()
    }, 100)
  )
})
</script>

<style scoped lang="scss">
.MDYDoc-container {
  display: flex;
  gap: 16px;
  justify-content: center;
  min-height: calc(100vh - 218px);

  .MDYDoc-Content {
    width: 100%;
    max-width: 780px;
    padding: 0 12px;

    :deep(div) {
      h1 {
        font-size: 3rem;
        line-height: 5rem;
      }

      h2 {
        padding-top: 24px;
        margin: 48px 0 16px;
        font-size: 1.75rem;
        line-height: 3rem;
        border-top: 1px solid rgb(var(--v-theme-MDYBackground));
      }

      h3 {
        margin: 32px 0 16px;
        font-size: 1.5rem;
        line-height: 2rem;
      }

      h4 {
        margin: 24px 0 8px;
        font-size: 1.25rem;
        line-height: 1.5rem;
      }

      h5 {
        margin: 16px 0 0;
        font-size: 1rem;
        line-height: 1.5rem;
      }

      h1,
      h2,
      h3,
      h4,
      h5 {
        .header-anchor::before {
          content: '#';
          opacity: 0;
          transition: opacity 0.3s;
        }

        &:hover {
          .header-anchor::before {
            opacity: 1;
          }
        }
      }

      p,
      ul,
      ol,
      blockquote,
      table {
        margin: 16px 0;
        line-height: 28px;

        code {
          padding: 3px 6px;
          background-color: rgb(var(--v-theme-MDYBackground));
          border-radius: 20px;
        }
      }

      a {
        color: rgb(var(--v-theme-primary));
        text-decoration: underline;
      }

      ul {
        padding-left: 1.25rem;
        margin: 16px 0;
        list-style: disc;

        li {
          padding: 0;
        }
      }

      code {
        font-family: var(--vp-font-family-mono) !important;
      }

      .vp-code {
        code {
          font-family: var(--vp-font-family-mono) !important;
        }
      }
    }
  }

  .aside {
    position: relative;
    width: 100%;
    max-width: 220px;

    .aside-fixed {
      position: fixed;
      width: stretch;
      max-width: 240px;
      height: min-content;
      margin-top: 24px;
      margin-right: 6%;
      background-color: rgb(var(--v-theme-MDYBackground));

      .v-list {
        background: transparent;

        .v-list-item {
          transition: all 0.3s;

          :deep(.v-list-item-title) {
            white-space: normal;
          }
        }
      }
    }
  }
}
</style>
