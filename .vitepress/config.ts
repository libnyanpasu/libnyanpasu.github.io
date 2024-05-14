import Container from 'markdown-it-container'
import FootNote from 'markdown-it-footnote'
import Token from 'markdown-it/lib/token'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vitepress'
// import { SearchPlugin, type SearchData } from 'vitepress-plugin-search'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'

const currentYear = new Date().getFullYear()

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // base: '/wiki/', // Github Pages
  title: 'Clash Nyanpasu',
  description: 'Clash Nyanpasu! (∠・ω< )⌒☆​',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Tutorial', link: '/introduction' },
          { text: 'FAQ', link: '/others/faq' }
        ],

        sidebar: [
          { text: 'Home', link: '/' },
          {
            text: 'Tutorial',
            items: [
              {
                text: 'Introduction',
                link: '/introduction'
              },
              { text: 'Installation', link: '/tutorial/install' },
              { text: 'Proxy Chain', link: '/tutorial/proxy-chain' }
            ]
          },
          {
            text: 'Development',
            link: '/zh-CN/development'
          },
          {
            text: 'Others',
            items: [
              { text: 'FAQ', link: '/others/faq' },
              { text: 'Clash Field', link: '/others/field' },
              { text: 'Q&A Convention ', link: '/others/issues' },
              {
                text: 'How To Ask',
                link: '/others/how-to-ask'
              }
            ]
          }
        ],

        footer: {
          message: `Clash Nyanpasu! (∠・ω< )⌒☆`,
          copyright: `This site is licensed under CC-BY-NC-SA 4.0. © ${currentYear} LibNyanpasu`
        }
      }
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '主页', link: '/zh-CN' },
          { text: '简介', link: '/zh-CN/introduction' },
          { text: '常见问题', link: '/zh-CN/others/faq' }
        ],

        sidebar: [
          { text: '主页', link: '/zh-CN' },
          {
            text: '文档',
            items: [
              {
                text: '简介',
                link: '/zh-CN/introduction'
              },
              { text: '安装', link: '/zh-CN/tutorial/install' },
              { text: '代理链', link: '/zh-CN/tutorial/proxy-chain' }
            ]
          },
          {
            text: '开发',
            link: '/zh-CN/development'
          },
          {
            text: '其他',
            items: [
              { text: '常见问题', link: '/zh-CN/others/faq' },
              { text: '问答公约', link: '/zh-CN/others/issues' },
              {
                text: '如何提问',
                link: '/zh-CN/others/how-to-ask'
              }
            ]
          }
        ],

        footer: {
          message: `Clash Nyanpasu! (∠・ω< )⌒☆`,
          copyright: `This site is licensed under CC-BY-NC-SA 4.0. © ${currentYear} LibNyanpasu`
        },

        // locales
        outlineTitle: '本页导航',
        lastUpdatedText: '最后更新',
        docFooter: {
          prev: '上一篇',
          next: '下一篇'
        },
        darkModeSwitchLabel: '外观', // Appearance
        lightModeSwitchTitle: '切换亮色主题', // Switch to light mode
        darkModeSwitchTitle: '切换暗色主题', // Switch to dark mode
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        langMenuLabel: '修改语言',
        editLink: {
          pattern:
            'https://github.com/LibNyanpasu/LibNyanpasu.github.io/edit/main/:path',
          text: '在 GitHub 上编辑此页'
        }
      }
    }
  },
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(FootNote)
      md.use(Container, 'theorem', {
        render: (tokens: Token[], idx: number) => {
          const token = tokens[idx]
          const info = token.info.trim().slice(7).trim()
          if (token.nesting === 1) {
            const title = md.renderInline(info)
            return `<div class="theorem"><p class="title">${title}</p>\n`
          } else {
            return `</div>\n`
          }
        }
      })
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/logo.png', // TODO: change to {light: '', dark: ''}

    socialLinks: [
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"/></svg>'
        },
        link: 'https://t.me/keikolog'
      },
      { icon: 'github', link: 'https://github.com/LibNyanpasu' }
    ],

    editLink: {
      pattern:
        'https://github.com/LibNyanpasu/LibNyanpasu.github.io/edit/main/:path'
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => {
          return tag.toLowerCase().indexOf('md-') === 0
        }
      }
    }
  },
  vite: {
    plugins: [
      // UnoCSS(),
      vuetify(),
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
    ],
    optimizeDeps: {
      include: ['vuetify']
    },
    ssr: {
      noExternal: ['vuetify']
    }
  },
  head: [
    [
      'script',
      {
        async: '',
        src: 'https://umami.majokeiko.com/script.js',
        'data-website-id': '9af35a41-8a82-4cde-84d2-11ebb2e85cdb'
      }
    ],
    [
      'link',
      {
        href: 'https://gcore.jsdelivr.net/npm/@mdi/font@7.x/css/materialdesignicons.min.css',
        rel: 'stylesheet'
      }
    ]
  ]
})
