// https://vitepress.dev/guide/custom-theme
/// <reference types="vite/client" />

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

import './styles/main.scss'

// import 'virtual:uno.css'
import { MotionPlugin } from '@vueuse/motion'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import 'vuetify/styles'

const vuetify = createVuetify({
  ssr: true,
  blueprint: md3
})

const theme: Theme = {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  NotFound,
  enhanceApp: ({ app }) => {
    app.use(vuetify)
    app.use(MotionPlugin)
  }
} satisfies Theme

export default theme
