const browserSync = require('browser-sync')

/**
 * ## browser-sync
 * There's no external config file, this is everything. Just a simple static
 * server but it will set mime types for files on which we've deleted the
 * extension.
 */
browserSync.create()
  .init({
    open: false,
    server: {
      baseDir: 'build',
      index: 'index.html',
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    watch: true
  })
