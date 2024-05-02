<template>
  <div class="MDYDoc-container">
    <Content class="MDYDoc-Content" />

    <div v-if="!(xs || sm)" class="aside">
      <div class="aside-fixed">
        <p class="title">{{ resolveTitle(theme) }}</p>

        <p class="item" v-for="item in headers">{{ item.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getHeaders, resolveTitle, type MenuItem } from '../utils/docs'
import { onContentUpdated, useData } from 'vitepress'
import { useDisplay } from 'vuetify'

const { sm, xs } = useDisplay()

const { frontmatter, theme } = useData()

const headers = shallowRef<MenuItem[]>([])

onContentUpdated(() => {
  headers.value = getHeaders(frontmatter.value.outline ?? theme.value.outline)
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
      padding: 24px;
      margin-top: 24px;
      margin-right: 6%;
      background-color: rgb(var(--v-theme-MDYBackground));
      border-radius: 24px;

      p.title {
        font-size: 1.25rem;
        line-height: 2rem;
      }

      p.item {
        margin: 4px 0;
      }
    }
  }
}
</style>
