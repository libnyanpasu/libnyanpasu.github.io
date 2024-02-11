export default {
  '**/*.vue': [
    'eslint -c .eslintrc.cjs',
    'stylelint --config stylelint.config.js'
  ],
  '**/*.{ts,tsx,js,jsx}': ['eslint -c .eslintrc.cjs'],
  '**/*.{ts,tsx,vue}': [() => 'tsc -p tsconfig.json --noEmit'],
  '**/*.{scss,css,sass}': ['stylelint --config stylelint.config.js']
}
