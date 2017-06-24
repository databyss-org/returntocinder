var path = require('path');

module.exports = {
  entry: ["babel-polyfill", "./src/index.jsx"],
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  module: {
    loaders: [
      {
        test: [/\.jsx?$/, /\.js?$/],
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-3']
        }
      },
      {
        test: /\.json$/, loader: 'json-loader'
      },
      {
        test: [/\.scss$/, /\.css$/],
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.otf$/,
        loader: 'url-loader'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: "file-loader",
        options: {
          name: "./images/[hash].[ext]"
        }
      },
      {
        test: /\.svg$/,
        loader: 'babel?presets[]=es2015,presets[]=react!svg-react'
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".js", ".jsx" ]
  }
};
