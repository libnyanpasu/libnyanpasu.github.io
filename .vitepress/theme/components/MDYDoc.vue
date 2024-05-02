<template>
  <div class="MDYDoc-container">
    <Content class="MDYDoc-Content" />

    <div v-if="!(xs || sm)" class="aside">
      <v-card class="aside-fixed" rounded="xl" :title="resolveTitle(theme)">
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="item in headers"
              class="mt-1 mb-1"
              rounded="xl"
              density="compact"
              :variant="hash === item.link ? 'tonal' : 'text'"
              :href="item.link"
              :title="item.title"
              @click="scrollIntoView(item.link)"
            />
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getHeaders, resolveTitle, type MenuItem } from '../utils/docs'
import { onContentUpdated, useData } from 'vitepress'
import { useDisplay } from 'vuetify'

const { sm, xs } = useDisplay()

const { frontmatter, theme, hash } = useData()

const headers = shallowRef<MenuItem[]>([])

const scrollIntoView = (link: string, options?: ScrollIntoViewOptions) => {
  const id = link.split('#')[1]

  const heading = document.getElementById(decodeURIComponent(id))

  heading?.scrollIntoView(options)
}

onContentUpdated(() => {
  headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)

  if (hash.value) {
    scrollIntoView(hash.value, { behavior: 'smooth' })
  }
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

      p {
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
