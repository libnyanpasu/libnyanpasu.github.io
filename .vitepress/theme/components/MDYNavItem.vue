<template>
  <v-list-group v-if="item.items" :value="item.text">
    <template v-slot:activator="{ props }">
      <v-list-item
        v-bind="props"
        class="rounded-pill mt-1 mb-1"
        color="primary"
        :title="item.text"
      />
    </template>

    <template v-for="item in item.items" :key="item.text">
      <MDYNavItem :item="item" />
    </template>
  </v-list-group>

  <v-list-item
    v-else
    class="rounded-pill mt-1 mb-1"
    :title="item.text"
    :href="item.link"
    :value="item.link"
  />
</template>

<script setup lang="ts">
import { type DefaultTheme } from 'vitepress'

const { item } = defineProps<{
  item: DefaultTheme.SidebarItem
}>()
</script>
