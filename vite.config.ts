// import { SearchPlugin, type SearchData } from 'vitepress-plugin-search'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dts: './types/auto-imports.d.ts'
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: './.vitepress/theme/components',
      extensions: ['vue'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/],
      dts: './types/components.d.ts',
      resolvers: [IconsResolver()]
    }),
    // Ref: https://github.com/unplugin/unplugin-icons
    Icons()
  ]
})
