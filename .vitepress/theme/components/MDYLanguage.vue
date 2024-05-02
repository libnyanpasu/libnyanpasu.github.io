<template>
  <v-btn icon>
    <v-icon icon="mdi-translate" />

    <v-menu activator="parent">
      <v-list>
        <v-list-item
          v-for="(item, index) in localeLinks"
          :key="index"
          :value="index"
          :title="item.text"
          :href="item.link"
        />
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { useLangs } from '../utils/langs'

const { localeLinks } = useLangs()
</script>
