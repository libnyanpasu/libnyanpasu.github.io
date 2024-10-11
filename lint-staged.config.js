export default {
  '**/*.vue': [
    'prettier --write',
    'eslint -c eslint.config.js',
    'stylelint --config stylelint.config.js'
  ],
  '**/*.{ts,tsx,js,jsx}': ['eslint -c eslint.config.js', 'prettier --write'],
  '**/*.{ts,tsx,vue}': [() => 'tsc -p tsconfig.json --noEmit'],
  '**/*.{scss,css,sass}': [
    'stylelint --config stylelint.config.js',
    'prettier --write'
  ],
  '**/*.{json,md}': ['prettier --write']
}
