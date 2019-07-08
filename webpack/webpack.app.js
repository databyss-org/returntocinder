const path = require('path')
const common = require('./webpack.common.js')

module.exports = {
  ...common,
  entry: ['babel-polyfill', './src/index.jsx'],
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: 'bundle.js',
  },
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: {
      index: 'index.html',
    },
  },
}
