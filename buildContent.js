#!/usr/bin/env node
const Metalsmith = require('metalsmith')
const debug = require('debug')

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
const Project = require('./lib/Project')

const dbg = debug('metalsmith-build')

dbg('building')
// noop this so no files are read
Metalsmith.prototype.read = async () => {
  await Project.readAll()
  const files = {}
  Object.values(Project.projects).forEach((project) => {
    const file = project.getMeta()
    file.contents = project.content
    const name = `${file.name}.md`
    files[name] = file
  })
  return files
}
const metalsmith = Metalsmith('./')
// metalsmith.source('projects')
metalsmith.clean(false)
metalsmith.destination('build')
metalsmith.metadata({
  ...config.get('meta'),
  buildDate: Date.now(),
  version: pkg.version,
  marked,
  moment,
  feather,
  url: (url) => {
    if (process.env.NODE_ENV !== 'production')
      return url
    return `/selfhosted-awesome-unlist${url}`
  }
})
metalsmith.use(async (files, ms) => {
  ms.metadata().projectCount = Object.values(files).length
})
metalsmith.use(overview())
metalsmith.use(markdown())
metalsmith.use(tags({
  handle: 'tags',
  metadataKey: 'tags',
  layout: 'tag.pug',
  sortBy: 'stargazers_count',
  path: 'tags/:tag.html',
  reverse: true
}))
metalsmith.use(tags({
  handle: 'language',
  metadataKey: 'languages',
  layout: 'tag.pug',
  path: 'languages/:tag.html',
  sortBy: 'stargazers_count',
  reverse: true
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
metalsmith.use((files, ms) => {
  // const fileData = Object.values(files)
  // dbg(fileData[fileData.length - 1].pagination.files)
  // dbg(ms.metadata().languages)
  // dbg(files)
  // dbg(Object.keys(files))
  dbg(files['reveal.js.html'])
})
metalsmith.build((err) => {
  if (err)
    throw err
  dbg('build succeeded')
})
