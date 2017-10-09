const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/index.jsx'],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: [/worker\.js?$/],
        loader: 'worker-loader?inline=true',
      },
      {
        test: [/\.jsx?$/, /\.js?$/],
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'react', 'stage-3']
        }
      },
      {
        test: /\.json$/, loader: 'json-loader'
      },
      {
        test: [/\.scss$/, /\.css$/],
        loaders: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
            }
          },
          'sass-loader'
        ],
      },
      {
        test: /\.otf$/,
        loader: 'url-loader'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'file-loader',
        options: {
          name: './images/[hash].[ext]'
        }
      },
      {
        test: /\.svg$/,
        loader: 'babel-loader?presets[]=env,presets[]=react!svg-react-loader'
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    historyApiFallback: {
      index: 'index.html'
    }
  }
};
