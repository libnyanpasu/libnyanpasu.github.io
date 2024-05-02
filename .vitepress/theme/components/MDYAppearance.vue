<template>
  <v-btn icon="mdi-theme-light-dark" @click="toggleAppearance" />
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'

const { isDark } = useData()

const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})
</script>
