module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:mocha/recommended',
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'mocha',
    'react-hooks',
    '@typescript-eslint'
  ],
  overrides: [
    {
      files: [
        '**.ts',
        '**.tsx'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'none',
            ignoreRestSiblings: true,
            vars: 'all'
          }
        ],
        '@typescript-eslint/quotes': [
          'error',
          'single'
        ],
        '@typescript-eslint/semi': [
          'error',
          'never'
        ],
        '@typescript-eslint/space-before-function-paren': [
          'error',
          {
            anonymous: 'always',
            asyncArrow: 'always',
            named: 'always'
          }
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true
          }
        ],
        '@typescript-eslint/indent': [
          'error',
          2
        ],
        'import/order': [
          'error',
          {
            alphabetize: {
              order: 'asc'
            }
          }
        ],
      }
    }
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'array-bracket-spacing': [
      'error',
      'always',
      {
        arraysInArrays: false,
        objectsInArrays: false,
        singleValue: true
      }
    ]
  }
}
