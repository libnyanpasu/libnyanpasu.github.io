<template>
  <div class="footer mt-6 pt-4 pb-2 d-flex align-center flex-column">
    <p>{{ theme.footer.message }}</p>

    <p>{{ theme.footer.copyright }}</p>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<style scoped lang="scss">
.footer {
  border-top: 1px solid rgb(var(--v-theme-MDYBackground));
}
</style>
