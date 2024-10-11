<template>
  <v-btn v-for="item in list" v-bind:key="item.text" :href="item.link">
    {{ item.text }}
  </v-btn>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { theme } = useData()

const list = computed(() => theme.value.nav)
</script>
