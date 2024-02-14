export default {
  '**/*.vue': [
    'prettier --write',
    'eslint -c .eslintrc.cjs',
    'stylelint --config stylelint.config.js'
  ],
  '**/*.{ts,tsx,js,jsx}': ['eslint -c .eslintrc.cjs', 'prettier --write'],
  '**/*.{ts,tsx,vue}': [() => 'tsc -p tsconfig.json --noEmit'],
  '**/*.{scss,css,sass}': [
    'stylelint --config stylelint.config.js',
    'prettier --write'
  ],
  '**/*.{json,md}': ['prettier --write']
}
