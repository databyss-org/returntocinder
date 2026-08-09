const path = require('path')
const common = require('./webpack.common.js')

module.exports = {
  ...common,
  entry: {
    bundle: ['babel-polyfill', './src/index.jsx'],
    'bundle.admin': ['babel-polyfill', './src/admin/index.jsx'],
  },
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: '[name].js',
  },
  devServer: {
    host: '0.0.0.0',
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin(?:\/.*)?$/, to: '/admin.html' },
        { from: /./, to: '/index.html' },
      ],
    },
  },
}
