#!/usr/bin/env node
const Metalsmith = require('metalsmith')
const debug = require('debug')
const {
  merge
} = require('lodash')

const markdown = require('metalsmith-markdown')
const layouts = require('metalsmith-layouts')
const tags = require('metalsmith-tags')
const config = require('config')
const marked = require('marked')
const moment = require('moment')
const feather = require('feather-icons')
const multimatch = require('multimatch')
const overview = require('./lib/overview')
const pkg = require('./package.json')

const dbg = debug('metalsmith-build')

dbg('building')
const metalsmith = Metalsmith('./')
metalsmith.source('projects')
metalsmith.clean(false)
metalsmith.destination('build')
metalsmith.metadata({
  ...config.get('meta'),
  buildDate: Date.now(),
  version: pkg.version,
  marked,
  moment,
  feather
})
metalsmith.use((files, ms) => {
  Object.values(files).forEach((file) => {
    merge(file, file.scraped, file.contributed)
  })
  const metadata = ms.metadata()
  metadata.projectCount = Object.values(files).length
})
metalsmith.use(overview())
metalsmith.use(markdown())
metalsmith.use(tags({
  layout: 'tag.pug',
  sortBy: 'stargazers_count',
  path: 'tags/:tag.html'
}))
metalsmith.use((files) => {
  const index = {}
  index.layout = 'index.pug'
  const projects = multimatch(Object.keys(files), '*.html')
  index.projects = projects.map((p) => files[p])
  index.contents = Buffer.from('')
  index.title = 'Selfhosed Awesome [Un]list'
  // dbg(index)
  files['index.html'] = index
})
metalsmith.use(layouts({
  directory: 'layouts',
  pattern: '**/*',
  default: 'project.pug',
  engineOptions: {
    basedir: 'layouts'
  }
}))
// metalsmith.use((files, ms) => {
// const fileData = Object.values(files)
// dbg(fileData[fileData.length - 1].pagination.files)
// dbg(ms.metadata().tags['File Sharing and Synchronization'])
// dbg(files)
// dbg(Object.values(files)[0].tags)
// })
metalsmith.build((err) => {
  if (err)
    throw err
  dbg('build succeeded')
})
