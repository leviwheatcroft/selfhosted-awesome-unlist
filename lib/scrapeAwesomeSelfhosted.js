const {
  promises: {
    readFile
  }
} = require('fs')
const debug = require('debug')
const asyncPool = require('tiny-async-pool')
const Project = require('./Project')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

async function scrapeAwesomeSelfhosted () {
  const projects = await scrapeList()
  asyncPool(6, projects, async (project) => {
    // dbg(project)
    await project.write()
    dbg(`scraped: ${project.scraped.name}`)
  })
}

async function scrapeList () {
  const content = await readFile(
    './config/awesome-selfhosted.md',
    { encoding: 'utf8' }
  )
  const reSections = /^##\s(.*)$/gm
  const sections = content.split(reSections)
  sections.shift()
  let projects = []

  while (sections.length) {
    const heading = sections.shift()
    const lines = sections.shift().split(/\r?\n/)
    // eslint-disable-next-line no-loop-func, no-await-in-loop
    await asyncPool(6, lines, async (line) => {
      projects.push(await parseLine(line, heading))
    })
  }
  projects = projects.filter(((p) => p))
  return projects
}

async function parseLine (line, heading) {
  const nameRe = /^ ?- \[(\w*?)]/
  const nameMatch = line.match(nameRe)
  if (!nameMatch)
    return false
  const name = nameMatch[1].toLowerCase()
  const linkRe = /\[([^\]]*)\]\(([^)]*)\)/g
  let linkMatches = [...line.matchAll(linkRe)]
  linkMatches = linkMatches.map((l) => l.slice(1))
  const links = Object.fromEntries([...linkMatches])
  // eslint-disable-next-line no-unused-vars, arrow-body-style
  const githubUrl = Object.values(links).find((url) => {
    return /github\.com/.test(url)
  }) || ''
  let owner = ''
  let repo = ''
  if (githubUrl) {
    const re = /github\.com\/([^/]*)\/([^/]*)/
    const matches = githubUrl.match(re)
    if (matches) {
      // eslint-disable-next-line prefer-destructuring
      owner = matches[1]
      // eslint-disable-next-line prefer-destructuring
      repo = matches[2]
    }
  }
  let description = line
  description = description.replace(/- /g, '')
  description = description.replace(linkRe, '')
  description = description.replace(/\([^)]*\)/g, '')
  description = description.replace(/\[[^\]]*\]/g, '')
  description = description.replace(/`[^`]*`/g, '')
  description = description.trim()

  const scraped = {
    name,
    owner,
    repo,
    heading,
    links,
    githubUrl,
    description
  }
  const project = await Project.fromProjectName(scraped.name)
  project.setScraped(scraped)
  return project
}

scrapeAwesomeSelfhosted()
