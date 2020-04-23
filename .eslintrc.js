module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
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
  extends: [
    'eslint:recommended',
    'plugin:mocha/recommended'
  ],
  plugins: [
    'mocha',
    '@typescript-eslint'
  ],
  rules: {
    'array-bracket-spacing': [ 'error', 'always', {
      arraysInArrays: false,
      objectsInArrays: false,
      singleValue: true
    } ],
    'eol-last': [ 'error', 'always' ],
    'import/order': [ 'error', { alphabetize: { order: 'asc' } } ],
    'object-curly-spacing': [ 'error', 'always' ],
  },
  overrides: [ {
    extends: [
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended'
    ],
    files: [ '**.ts', '**.tsx' ],
    rules: {
      '@typescript-eslint/no-unused-vars': [ 'warn', {
        args: 'none',
        ignoreRestSiblings: true,
        vars: 'all'
      } ],
      '@typescript-eslint/quotes': [ 'error', 'single' ],
      '@typescript-eslint/semi': [ 'error', 'never' ],
      '@typescript-eslint/space-before-function-paren': [ 'error', {
        anonymous: 'always',
        asyncArrow: 'always',
        named: 'always'
      } ],
      '@typescript-eslint/explicit-function-return-type': [ 'error', { allowExpressions: true } ],
      '@typescript-eslint/indent': [ 'error', 2 ],
    }
  } ],
}
