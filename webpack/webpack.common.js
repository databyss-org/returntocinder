const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      systemvars: true,
    }),
  ],
  module: {
    rules: [
      {
        test: [/worker\.js?$/],
        use: 'worker-loader?inline=true',
      },
      {
        test: [/\.jsx?$/, /\.js?$/],
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          query: {
            presets: ['env', 'react', 'stage-3']
          }
        }],
      },
      {
        test: /\.json$/,
        use: 'json-loader',
        type: 'javascript/auto',
      },
      {
        test: [/\.scss$/, /\.css$/],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
            }
          },
          { loader: 'sass-loader' }
        ],
      },
      {
        test: /\.otf$/,
        use: 'url-loader',
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: './images/[hash].[ext]'
          }
        }],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true // true outputs JSX tags
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx']
  },
};
