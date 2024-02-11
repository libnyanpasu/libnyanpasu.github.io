// https://vitepress.dev/guide/custom-theme
/// <reference types="vite/client" />

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

import './styles/main.scss'

import 'virtual:uno.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  NotFound,
  enhanceApp: (_ctx) => {}
} satisfies Theme

export default theme
