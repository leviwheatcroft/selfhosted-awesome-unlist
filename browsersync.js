import browserSync from 'browser-sync'

/**
 * ## browser-sync
 * There's no external config file, this is everything. Just a simple static
 * server but it will set mime types for files on which we've deleted the
 * extension.
 *
 * `build.js` uses browser-sync's http api to trigger a reload.
 */
browserSync.create()
.init({
  open: false,
  server: {
    baseDir: 'build/site',
    index: 'index.html',
    serveStaticOptions: {
      extensions: ['html']
    }
    // serveStaticOptions: {
    //   // this is a bit hacky. If there's no `.` within the last 5 chars of a
    //   // path, then set the header to `text/html`. Works nicely for me. YMMV.
    //   setHeaders: (res, path, stat) => {
    //     if (/\..{1,4}$/.exec(path)) return
    //     res.setHeader('content-type', 'text/html')
    //   }
    // }
  },
  watch: true
})
