#!/usr/bin/env node
const Metalsmith = require('metalsmith')
const debug = require('debug')
const config = require('./config')

const dbg = debug('metalsmith-build')

dbg('building')
const metalsmith = Metalsmith('./')
metalsmith.source('projects')
metalsmith.clean(false)
metalsmith.destination('build')
metalsmith.metadata(config.meta)
metalsmith.build((err) => {
  if (err)
    throw err
  dbg('build succeeded')
})
