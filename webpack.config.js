const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
            loader: MiniCssExtractPlugin.loader
          },
          // {
          //   loader: 'style-loader' // creates style nodes from JS strings
          // },
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          // {
          //   loader: 'style-loader' // creates style nodes from JS strings
          // },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'site.css'
    })
  ],
  resolve: {
    alias: {
      jquery: 'jquery/src/jquery'
    },
    extensions: ['.js', '.less', '.pug']
  }
}
