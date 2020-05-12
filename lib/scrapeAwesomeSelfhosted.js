const {
  promises: {
    readFile,
    mkdir
  }
} = require('fs')
const debug = require('debug')
const config = require('config')
const asyncPool = require('tiny-async-pool')
const Project = require('./Project')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

async function scrapeAwesomeSelfhosted () {
  try {
    await mkdir('projects/scraped')
  } catch (err) {
    if (!err.code === 'EEXIST')
      throw err
  }
  const lists = [...config.get('awesomeLists')]
  while (lists.length) {
    await scrapeList(lists.shift())
    let projects = Object.values(Project.projects)
    if (process.env.LIMIT)
      projects = projects.slice(0, process.env.LIMIT)
    await asyncPool(6, projects, async (project) => {
      await project.writeScraped()
      dbg(`scraped: ${project.meta.name}`)
    })
  }
  dbg(`scraped ${Object.values(Project.projects).length} from lists`)
}

async function scrapeList (listPath) {
  const source = listPath.match(/-(\w.*)\.md/)[1]
  const content = await readFile(listPath, { encoding: 'utf8' })
  const reSections = /^##\s(.*)$/gm
  const sections = content.split(reSections)
  sections.shift()

  while (sections.length) {
    const heading = sections.shift()
    const lines = sections.shift().split(/\r?\n/)
    // eslint-disable-next-line no-loop-func
    await asyncPool(6, lines, async (line) => {
      const data = await parseLine(line, heading, source)
      if (!data)
        return
      // eslint-disable-next-line no-new
      new Project({ data })
    })
  }
}

async function parseLine (line, heading, source) {
  const nameRe = /^\s{0,4}[-*] \[([\w\s-]*?)]/
  const nameMatch = line.match(nameRe)
  if (!nameMatch) {
    dbg('discard', line)
    return false
  }
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

  return {
    name,
    owner,
    repo,
    heading,
    links,
    githubUrl,
    description,
    source
  }
}

scrapeAwesomeSelfhosted()
