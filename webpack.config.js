const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    popup: './src/popup.js',
    serviceWorker: './src/serviceWorker.js',
    contentScript: './src/contentScript.js'
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'static' }]
    })
  ],
  optimization: {
    minimize: false
  },
  devtool: 'source-map' // Options like 'cheap-module-source-map' for development
}
