// Typescript lint rules that we don't need
const customTSRules = {
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn', // We need to use any for some cases, so it just a warning until we can suppress it
  'no-undef': 'off' // It will be handled by typescript, so we don't need it
}

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    'prettier',
    'plugin:prettier/recommended'
    // 'eslint:recommended'
  ],
  overrides: [
    {
      // Rules for typescript files
      files: ['**/*.{ts,tsx,mts,cts}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'standard',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
      ],
      rules: {
        ...customTSRules
      }
    },
    {
      // Rules for vue files
      files: ['**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module'
      },
      extends: [
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
      ],
      rules: {
        // Vue rules that we don't need
        'vue/multi-word-component-names': 'off', // No needed for most of usage
        'vue/html-indent': 'off', // handled by prettier
        'vue/no-unused-vars': 'warn',
        ...customTSRules
      }
    }
  ],
  // parserOptions: {
  //     ecmaVersion: 'latest',
  //     sourceType: 'module',
  //     parser: '@babel/eslint-parser'
  // },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'linebreak-style': ['error', 'unix']
  }
}
