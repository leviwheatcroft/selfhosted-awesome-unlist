const webpack = require('webpack')
const debug = require('debug')
const webpackConfig = require('./webpack.config')

const dbg = debug('metalsmith-build')

module.exports = function buildAssets () {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        dbg(err)
        return reject(new Error('webpack build error'))
      }
      if (stats.hasErrors()) {
        dbg(stats.compilation.errors)
        return reject(new Error('webpack build error'))
      }

      // trigger browsersync reload
      dbg(`webpack looks ok: ${stats.hash}`)
      return resolve()
    })
  })
}
