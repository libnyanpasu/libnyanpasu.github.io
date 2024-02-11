import PostCssSCSS from 'postcss-scss'

export default {
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    'stylelint-config-html/vue'
  ],
  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-declaration-block-no-ignored-properties'
  ],
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
    '**/typings/**/*',
    'public/css/**/*'
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] }
    ],
    'font-family-name-quotes': null,
    'font-family-no-missing-generic-family-keyword': null,
    'max-nesting-depth': [
      4,
      {
        ignore: ['blockless-at-rules', 'pseudo-classes']
      }
    ],
    'declaration-block-no-duplicate-properties': true,
    'no-duplicate-selectors': true,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'value-no-vendor-prefix': [true, { ignoreValues: ['box'] }],
    'at-rule-no-unknown': null,
    'import-notation': null
  },
  overrides: [
    {
      files: ['**/*.scss', '*.scss'],
      customSyntax: PostCssSCSS
    }
  ]
}
