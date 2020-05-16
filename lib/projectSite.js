const axios = require('axios').default
const TurndownService = require('turndown')
const MarkdownIt = require('markdown-it')

const turndownService = new TurndownService()
const markdownIt = new MarkdownIt()

const debug = require('debug')

const dbg = debug('sau')

async function scrape (project) {
  const {
    owner,
    repo
  } = project.getMeta()
  if (
    (owner) &&
    (repo)
  )
    return
  const siteUrl = Object.values(project.getMeta('links')).shift()
  let res
  try {
    res = await axios.get(siteUrl, {
      responseType: 'text'
    })
  } catch (err) {
    dbg('error fetching site:', err)
    project.setMeta({ error: err.message })
    return
  }
  const markdown = turndownService.turndown(res.data)
  const html = markdownIt.render(markdown)
  project.setContent(Buffer.from(html, 'utf-8'))
}

module.exports = {
  scrape
}
