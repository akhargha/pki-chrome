const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'development' || true) {
        // Disable JavaScript minification
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimize: false
        }

        // Remove TerserPlugin to prevent minification
        webpackConfig.optimization.minimizer =
          webpackConfig.optimization.minimizer.filter(
            plugin => !(plugin instanceof TerserPlugin)
          )

        // Disable HTML minification and beautify HTML
        webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
          if (plugin instanceof HtmlWebpackPlugin) {
            return new HtmlWebpackPlugin({
              ...plugin.userOptions,
              minify: false,

              excludeChunks: ['contentService', 'serviceWorker']
            })
          }
          return plugin
        })

        // Modify the output filenames for development builds
        webpackConfig.output.filename = 'static/js/[name].js'
        webpackConfig.output.chunkFilename = 'static/js/[name].chunk.js'
      }

      // Add polyfill for 'url' module
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          ...webpackConfig.resolve.fallback,
          url: require.resolve('url')
        }
      }

      return {
        ...webpackConfig,
        entry: {
          main: [
            env === 'development' &&
              require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs
          ].filter(Boolean),
          contentService: './src/chromeServices/contentService.ts',
          serviceWorker: './src/chromeServices/serviceWorker.ts'
        },
        output: {
          ...webpackConfig.output,
          filename: 'static/js/[name].js'
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false
        }
      }
    }
  }
}
