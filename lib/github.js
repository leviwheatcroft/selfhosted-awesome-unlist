const config = require('config')
const moment = require('moment')
// const got = require('got')
const {
  Octokit
} = require('@octokit/rest')
const debug = require('debug')

const octokit = new Octokit({
  auth: config.get('githubAccessToken'),
  userAgent: 'selfhosted-awesome-unlist'
})

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

async function getReadme (owner, repo) {
  const res = await octokit.repos.getReadme({ owner, repo })
  const content = Buffer.from(res.data.content, 'base64')
  let type
  if (/\.md/.test(res.data.name))
    type = 'markdown'
  if (/\.rst/.test(res.data.name))
    type = 'restructured'
  if (!type)
    throw new Error(`bad readme type ${res.data.name}`)
  return {
    content,
    type
  }
}

async function getRepository (owner, repo) {
  const mediaType = {
    previews: ['mercy'] // include topics in response
  }
  const res = await octokit.repos.get({ owner, repo, mediaType })
  return res.data
}

// async function getLanguages (owner, repo) {
//   const res = await octokit.repos.listLanguages({ owner, repo })
//   return res.data
// }

async function scrape (project) {
  const {
    owner,
    repo
  } = project.getMeta()
  if (
    (!owner) ||
    (!repo)
  )
    return

  const scraped = {}

  let repository
  try {
    repository = await getRepository(
      owner,
      repo
    )
  } catch (err) {
    dbg('error getting repository:', { owner, repo })
    project.setMeta({ error: err.message })
    return
  }
  // dbg('topics', repository.topics)
  scraped.name = repository.name.toLowerCase()
  scraped.stargazers_count = repository.stargazers_count
  // doc.watchers_count = repository.watchers_count
  scraped.open_issues_count = repository.open_issues_count
  scraped.forks_count = repository.forks_count
  scraped.pushed_at = repository.pushed_at
  scraped.created_at = repository.created_at
  scraped.updated_at = repository.updated_at
  scraped.language = repository.language || 'unspecified'
  scraped.license = repository.license
  scraped.topics = repository.topics || []

  const years = moment(Date.now()).diff(scraped.created_at, 'years', true)
  scraped.starsYears = Math.round(scraped.stargazers_count / years)

  project.setMeta(scraped)

  let readme
  try {
    readme = await getReadme(owner, repo)
  } catch (err) {
    dbg('error getting readme:', { owner, repo })
    dbg(err)
    project.setMeta({ error: err.message })
    return
  }
  project.setContent(readme.content)
  project.setMeta({ readmeType: readme.type })
}

module.exports = {
  scrape
}
