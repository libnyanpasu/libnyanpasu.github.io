import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import prettierConfig from '@vue/eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.join(__dirname, '.gitignore')

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  ...neostandard({
    noStyle: true
  }),
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  prettierConfig,
  ...vueTsEslintConfig(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
