const {
  promises: {
    readdir
  }
} = require('fs')
const debug = require('debug')
const asyncPool = require('tiny-async-pool')
const Project = require('./Project')
const tags = require('./tags')
const {
  scrape
} = require('./github')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

async function populateProjects () {
  const files = await readdir('projects')
  await asyncPool(6, files, async (file) => {
    const project = await Project.fromFileName(file)
    await project.rmFile()
    await scrape(project)
    tags(project)
    await project.write()
    dbg(`populated: ${project.getMeta('name')}`)
  })
}

populateProjects()
