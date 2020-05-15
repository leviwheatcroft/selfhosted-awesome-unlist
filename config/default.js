const tagCategories = require('./tagCategories.json')

module.exports = {
  meta: {
    siteName: 'Selfhosted Awesome [Un]list'
  },
  autoTags: {
    Docker: /docker/i
  },
  overviewTargetLength: 500,
  awesomeLists: [
    'config/awesome-selfhosted.md',
    'config/awesome-sysadmin.md'
  ],
  tagCategories
}
