<template>
  <v-btn icon>
    <v-icon icon="mdi-palette" />

    <v-menu activator="parent" :close-on-content-click="false">
      <v-card>
        <v-color-picker
          elevation="0"
          :modes="['hex']"
          v-model="color"
          hide-inputs
        />

        <v-card-actions>
          <v-btn @click="apply">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { color } from '../store'
import { applyTheme } from '../utils/color'
import { useData } from 'vitepress'

const { isDark } = useData()

const theme = useTheme()

const apply = () => {
  applyTheme(color.value, theme)
}

onBeforeMount(() => {
  theme.global.name.value = isDark.value ? 'dark' : 'light'

  applyTheme(color.value, theme)
})
</script>
