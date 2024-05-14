import transformerCompileClass from '@unocss/transformer-compile-class'
import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      dark: {
        dark: '.dark-mode',
        light: '.light-mode'
      }
    }),
    presetIcons(),
    presetAttributify()
  ],
  content: {
    filesystem: ['**/*.{scss,css,html,js,ts,jsx,tsx,vue,svelte,astro}']
  },
  rules: [
    [
      /^bg-gradient-(\d+)$/,
      ([, d]) => ({
        '--un-gradient-shape': `${d}deg;`,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops);',
        'background-image': 'linear-gradient(var(--un-gradient));'
      })
    ],
    [
      /^-bg-gradient-(\d+)$/,
      ([, d]) => ({
        '--un-gradient-shape': `-${d}deg;`,
        '--un-gradient': 'var(--un-gradient-shape), var(--un-gradient-stops);',
        'background-image': 'linear-gradient(var(--un-gradient));'
      })
    ],
    [
      'font-noto-serif',
      {
        'font-family': '"Noto Serif SC", "Noto Serif TC", serif'
      }
    ]
  ],
  transformers: [
    transformerCompileClass({
      classPrefix: 'ouo-'
    }),
    transformerDirectives()
  ]
})
