<template>
  <div class="d-flex flex-column justify-center">
    <v-img class="logo" :src="theme.logo" />

    <v-list v-model:selected="selected" mandatory>
      <MDYNavItem :item="{ text: 'Home', link: '/' }" />

      <template v-for="item in sidebar">
        <MDYNavItem :item="item" />
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { useSidebar } from 'vitepress/theme'

const { site, theme } = useData()

const { sidebar } = useSidebar()

const route = useRoute()

const selected = ref([route.path.replace('.html', '')])
</script>

<style scoped lang="scss">
.logo {
  width: 200px;
  margin: 0 auto;
}
</style>
