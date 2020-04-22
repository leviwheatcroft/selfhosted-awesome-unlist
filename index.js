#!/usr/bin/env node
const Metalsmith = require('metalsmith')
const debug = require('debug')

const markdown = require('metalsmith-markdown')
const layouts = require('metalsmith-layouts')


const config = require('./config')

const dbg = debug('metalsmith-build')

dbg('building')
const metalsmith = Metalsmith('./')
metalsmith.source('projects')
metalsmith.clean(false)
metalsmith.destination('build')
metalsmith.metadata(config.meta)

metalsmith.use(markdown())
metalsmith.use(layouts({
  directory: 'layouts',
  pattern: '**/*',
  default: 'project.pug',
  engineOptions: {
    basedir: 'layouts'
  }
}))
metalsmith.build((err) => {
  if (err)
    throw err
  dbg('build succeeded')
})
