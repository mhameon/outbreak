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
