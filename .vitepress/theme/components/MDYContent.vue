<template>
  <MDYHome v-if="frontmatter.layout === 'home'" />

  <MDYDoc v-else />
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>
