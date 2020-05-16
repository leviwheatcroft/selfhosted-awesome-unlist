const debug = require('debug')
const asyncPool = require('tiny-async-pool')
const Project = require('./Project')
const tags = require('./tags')
const {
  scrape: scrapeGithub
} = require('./github')
const {
  scrape: scrapeProjectSite
} = require('./projectSite.js')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

async function populateProjects () {
  await Project.readAll('scraped')
  const projects = Object.values(Project.projects)
  await asyncPool(12, projects, async (project) => {
    await project.removeScraped()
    await scrapeGithub(project)
    await scrapeProjectSite(project)
    tags(project)
    await project.writeScraped()
    dbg(`populated: ${project.getMeta('name')}`)
  })
}

populateProjects()
