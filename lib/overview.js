const debug = require('debug')
const cheerio = require('cheerio')
const config = require('config')

const overviewTargetLength = config.get('overviewTargetLength')

// eslint-disable-next-line no-unused-vars
const dbg = debug('metalsmith-overview')

function overview (files, ms) {
  const {
    stats
  } = ms.metadata()
  let overviewLength = 0

  Object.values(files).forEach((file) => {
    if (
      (!file.owner) ||
      (!file.repo)
    ) {
      file.overview = file.description
      return
    }

    const $readme = cheerio.load(file.contents.toString())
    const $overview = cheerio.load('<div class=\'overview\'></div>')
    try {
      $readme.root().find('p').each((idx, el) => {
        const $el = cheerio(el)
        $overview('.overview').append($el)
        if ($overview('.overview').text().length > overviewTargetLength) {
          $overview('.overview').append($el.nextUntil('h1, h2, h3, h4'))
          throw new Error('length')
        }
      })
    } catch (err) {
      if (err.message !== 'length')
        throw err
    }
    $overview.root().find('img').remove()
    $overview.root().find('a').each((idx, el) => {
      const $el = cheerio(el)
      if (!/\w/.test($el.text()))
        $el.remove()
    })

    file.overview = $overview('.overview').html()
    overviewLength += $overview('.overview').text().length
  })
  stats.totalLengthKb = Math.floor(overviewLength / 1024)
  stats.averageLengthB = Math.floor(overviewLength / stats.projectCount)
}

module.exports = () => overview
