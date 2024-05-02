import { postcssIsolateStyles } from 'vitepress'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [/\.css$/]
    }),
    autoprefixer()
  ]
}
