<template>
  <div class="d-flex flex-column justify-center">
    <!--TODO: Add drag animation-->
    <v-img
      class="logo"
      :src="theme.logo"
      v-motion
      :initial="{ scale: 1, rotate: 0 }"
      :hovered="{
        scale: 1.05,
        transition: {
          delay: 0.5
        }
      }"
      draggable="false"
      :tapped="{
        scale: 0.95,
        rotate: 360,
        transition: {
          delay: 0.5
        }
      }"
    />

    <v-list v-model:selected="selected" v-model:opened="opened" mandatory>
      <!-- <MDYNavItem :item="{ text: 'Home', link: '/' }" /> -->

      <template v-for="item in sidebar">
        <MDYNavItem :item="item" />
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { useData, useRoute, type DefaultTheme } from 'vitepress'
import { useSidebar } from 'vitepress/theme'

const { site, theme } = useData()

const { sidebar } = useSidebar()

const route = useRoute()

const selected = ref([route.path.replace('.html', '')])
const iterNodes = (items: DefaultTheme.SidebarItem[]) => {
  return items.reduce<string[]>((acc, item) => {
    if (item.items) {
      for (const subItem of item.items) {
        if (
          subItem.link == route.path.replace('.html', '') &&
          !acc.includes(item.text!)
        ) {
          acc.push(item.text!)
        }
        if (subItem.items) {
          acc.push(...iterNodes(subItem.items))
        }
      }
    }
    return acc
  }, [])
}
const opened = ref(iterNodes(sidebar.value))
console.log(opened.value)
</script>

<style scoped lang="scss">
.logo {
  width: 200px;
  margin: 0 auto;
}
</style>
