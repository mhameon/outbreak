module.exports = {
    extends: [
        '../.eslintrc.js',
        'plugin:react/recommended'
    ],
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
    overrides: [ {
        plugins: [
            'react'
        ],
        files: [
            '**.jsx',
            '**.tsx'
        ],
        rules: {
            'jsx-quotes': [
                'error',
                'prefer-double'
            ],
            'react/jsx-first-prop-new-line': [
                'error',
                'multiline'
            ],
            'react/jsx-max-props-per-line': [
                'error',
                {
                    maximum: 1,
                    when: 'always'
                }
            ],
            'react/jsx-sort-props': [
                'error',
                {
                    callbacksLast: true,
                    shorthandFirst: true,
                    ignoreCase: true,
                    noSortAlphabetically: false,
                    reservedFirst: true
                }
            ]
        }
    }
    ],
}
