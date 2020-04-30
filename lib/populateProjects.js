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
  await Project.readAll('scraped')
  const projects = Object.values(Project.projects)
  await asyncPool(6, projects, async (project) => {
    await project.removeScraped()
    await scrape(project)
    tags(project)
    await project.writeScraped()
    dbg(`populated: ${project.getMeta('name')}`)
  })
}

populateProjects()
