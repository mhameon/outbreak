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
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'mocha',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:mocha/recommended',
    'plugin:import/recommended'
  ],
  rules: {
    'array-bracket-spacing': [ 'error', 'always', {
      arraysInArrays: false,
      objectsInArrays: false,
      singleValue: true
    } ],
    'eol-last': [ 'error', 'always' ],
    'key-spacing': [ 'error', { 'afterColon': true, 'beforeColon': false, 'mode': 'strict' } ],
    'keyword-spacing': [ 'error', { 'after': true, 'before': true } ],
    'no-eval': 'error',
    'no-irregular-whitespace': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [ 'error', 'always' ],
  },
  overrides: [ {
    extends: [
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended'
    ],
    plugins: [
      'typescript-sort-keys',
      'import'
    ],
    files: [ '**.ts', '**.tsx' ],
    rules: {
      '@typescript-eslint/no-explicit-any': [ 'warn' ],
      '@typescript-eslint/member-delimiter-style': [ 'error',
        {
          'multiline': { 'delimiter': 'none', 'requireLast': false },
          'singleline': { 'delimiter': 'semi', 'requireLast': false }
        }
      ],
      '@typescript-eslint/no-unused-vars': [ 'warn', {
        args: 'none',
        ignoreRestSiblings: true,
        vars: 'all'
      } ],
      '@typescript-eslint/quotes': [ 'error', 'single' ],
      '@typescript-eslint/semi': [ 'error', 'never' ],
      '@typescript-eslint/explicit-function-return-type': [ 'error', { allowExpressions: true } ],
      '@typescript-eslint/indent': [ 'error', 2 ],
      '@typescript-eslint/explicit-module-boundary-types': [ 'error', { allowArgumentsExplicitlyTypedAsAny: true } ],
      'import/no-unresolved': [ 'off', { caseSensitive: false } ],
    }
  } ],
}
