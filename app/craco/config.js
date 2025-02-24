const path = require('path')
const enableImportsFromExternalPaths = require('./enableImportsFromExternalPaths')

const shared = path.resolve(__dirname, '../../shared')

module.exports = {
  webpack: {
    alias: {
      '#shared': shared,
    }
  },
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          enableImportsFromExternalPaths(webpackConfig, [
            shared
          ])
          return webpackConfig
        },

      },
    },
  ],
}

// const { CracoAliasPlugin } = require('react-app-alias-ex')
// const path = require('node:path')
//
// const options = {
//   alias: {
//     '#shared': path.resolve(__dirname, '../../shared')
//   }
// }
//
// module.exports = {
//   plugins: [
//     {
//       plugin: CracoAliasPlugin,
//       options
//     }
//   ]
// }

// const CracoAlias = require('craco-alias')
// module.exports = {
//   plugins: [
//     {
//       plugin: CracoAlias,
//       options: {
//         source: 'options',
//         baseUrl: '../', // this is from where all search in files will start
//         aliases: {
//           '#shared': './shared', // path from src folder
//         }
//       }
//     }
//   ]
// }
