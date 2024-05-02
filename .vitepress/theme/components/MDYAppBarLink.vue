<template>
  <v-btn v-for="item in list" :href="item.link">
    {{ item.text }}
  </v-btn>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()

const list = computed(() => theme.value.nav)
</script>
