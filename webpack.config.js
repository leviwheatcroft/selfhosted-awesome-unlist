const path = require('path')

const mode = process.env.NODE_ENV || 'development'

module.exports = {
  mode,
  entry: './assets/index.js',
  devtool: 'source-map',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'site.js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
          {
            loader: 'less-loader' // compiles Less to CSS
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
