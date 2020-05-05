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
const {
  promises: {
    writeFile
  }
} = require('fs')
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
metalsmith.use((files, ms) => {
  const meta = ms.metadata()

  // add counts to tags on project files
  Object.values(files).forEach((file) => {
    if (!file.tags)
      return
    file.tags.forEach((tag) => {
      tag.count = meta.tags[tag.name].length
    })
  })

  // discard tags with less than 5 projects
  Object.entries(meta.tags).forEach(([name, projects]) => {
    if (projects.length > 4)
      return
    delete meta.tags[name]
    delete files[`tags/${name}.html`]
  })

  // convert tags structure to an array, and sort
  // eslint-disable-next-line arrow-body-style
  meta.tags = Object.entries(meta.tags).map(([name, projects]) => {
    let category = 'other'
    const {
      urlSafe
    } = projects
    // eslint-disable-next-line no-shadow
    Object.entries(config.get('tagCategories')).forEach(([_category, tags]) => {
      if (tags.includes(name))
        category = _category
    })
    return {
      name,
      projects,
      category,
      urlSafe
    }
  })
  meta.tags.sort((a, b) => b.projects.length - a.projects.length)
})
metalsmith.use((files) => {
  const index = {}
  index.layout = 'index.pug'
  const projects = multimatch(Object.keys(files), '*.html')
  index.projects = projects.map((p) => files[p])
  index.contents = Buffer.from('')
  index.title = 'Selfhosted Awesome [Un]list'
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
metalsmith.use(async (files, ms) => {
  const tagNames = Object.keys(ms.metadata().tags)
  const tagNamesJson = JSON.stringify(tagNames, null, 2)
  await writeFile('debug/tagNames.json', tagNamesJson)
  // const fileData = Object.values(files)
  // dbg(fileData[fileData.length - 1].pagination.files)
  // dbg(ms.metadata().languages)
  // dbg(files)
  // dbg(Object.keys(files))
  // dbg(ms.metadata().tags.Docker)
  // dbg(files['tags/docker.html'])
})
metalsmith.build((err) => {
  if (err)
    throw err
  dbg('build succeeded')
})
