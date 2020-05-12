const debug = require('debug')
const MarkdownIt = require('markdown-it')
const cheerio = require('cheerio')
const rst2html = require('rst2html')

const markdown = new MarkdownIt()
markdown.set({ html: true })

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
      (!file.repo) ||
      (!file.readmeType)
    ) {
      file.overview = file.description
      return
    }

    let readme
    if (file.readmeType === 'markdown')
      readme = markdown.render(file.contents.toString())
    else if (file.readmeType === 'restructured')
      readme = rst2html(file.contents.toString())
    const $readme = cheerio.load(readme)
    const $overview = cheerio.load('<div class=\'overview\'></div>')
    try {
      $readme('body').children().each((idx, el) => {
        const $el = cheerio(el)
        if ($el.is('h1, h2, h3, h4'))
          return
        if ($el.find('img').length) {
          // dbg($el('img'))
          return
        }

        $overview('.overview').append($el)
        // dbg($overview('.overview').text())
        if ($overview('.overview').text().length > 300) {
          $overview('.overview').append($el.nextUntil('h1, h2, h3, h4'))
          throw new Error('length')
        }
      })
    } catch (err) {
      if (err.message !== 'length')
        throw err
    }


    file.overview = $overview('.overview').html()
    overviewLength += $overview('.overview').text().length
    if (file.name === 'archivebox')
      dbg(file.overview)
  })
  stats.totalLengthKb = Math.floor(overviewLength / 1024)
  stats.averageLengthB = Math.floor(overviewLength / stats.projectCount)
}

module.exports = () => overview
