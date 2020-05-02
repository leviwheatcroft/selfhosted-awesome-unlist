const config = require('config')
const debug = require('debug')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

function tags (project) {
  // eslint-disable-next-line no-shadow
  let tags = []
  // tags.push(project.getMeta('language'))

  tags.push(project.getMeta('heading'))
  tags.push(project.getMeta('source'))

  if (
    (!project.getMeta('owner')) ||
    (!project.getMeta('repo'))
  )
    tags.push('No Repo')
  tags.concat(project.getMeta('tags') || [])

  if (project.getMeta('error'))
    tags.push('Error')

  const autoTags = config.get('autoTags')
  Object.entries(autoTags).forEach(([tag, re]) => {
    if (re.test(project.content))
      tags.push(tag)
  })
  tags = tags.filter((t) => t)
  project.setMeta({ tags })
}

module.exports = tags
