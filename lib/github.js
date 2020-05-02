const config = require('config')
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
  const readme = Buffer.from(res.data.content, 'base64')
  return readme
}

async function getRepository (owner, repo) {
  const res = await octokit.repos.get({ owner, repo })
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
    repository = await getRepository(owner, repo)
  } catch (err) {
    dbg('error getting repository:', { owner, repo })
    project.setMeta({ error: err.message })
    return
  }
  scraped.name = repository.name.toLowerCase()
  scraped.stargazers_count = repository.stargazers_count
  // doc.watchers_count = repository.watchers_count
  scraped.open_issues_count = repository.open_issues_count
  scraped.pushed_at = repository.pushed_at
  scraped.created_at = repository.created_at
  scraped.updated_at = repository.updated_at
  scraped.language = repository.language || 'unspecified'
  scraped.license = repository.license
  project.setMeta(scraped)

  let content
  try {
    content = await getReadme(owner, repo)
  } catch (err) {
    dbg('error getting readme:', { owner, repo })
    project.setMeta({ error: err.message })
    return
  }
  project.setContent(content)
}

module.exports = {
  scrape
}
