const cheerio = require('cheerio')
const marked = require('marked')
const debug = require('debug')

// eslint-disable-next-line no-unused-vars
const dbg = debug('metalsmith')

function overview (files) {
  Object.values(files).forEach((file) => {
    if (
      (!file.owner) ||
      (!file.repo)
    ) {
      file.overview = file.description
      return
    }
    const htmlReadme = marked(file.contents.toString())
    const readme = cheerio.load(htmlReadme)
    // eslint-disable-next-line no-shadow
    // dbg(readme)
    let headingCount = 0
    readme('body').children().each((idx, el) => {
      if (
        (el.type === 'tag') &&
        (['h1', 'h2', 'h3', 'h4'].includes(el.name))
      ) {
        headingCount += 1
        cheerio(el).remove()
      } else if (headingCount !== 1) {
        cheerio(el).remove()
      }
    })
    readme('body')
      .find('img')
      .closest('p')
      .remove()
    let html = cheerio.html(readme('body'))
    // you end up with \n for each collapsed element, so collapse those
    html = html.replace(/(\s)\s+/g, '$1')
    file.overview = html
  })
}

module.exports = () => overview
