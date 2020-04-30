const grayMatter = require('gray-matter')
const {
  merge,
  get
} = require('lodash')
const {
  promises: {
    readFile,
    writeFile,
    unlink
  }
} = require('fs')
const debug = require('debug')

// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

const placeholderContent = 'this is a placeholder'

module.exports = class Project {
  constructor (raw = {}) {
    raw.scraped = raw.scraped || {}
    raw.contributed = raw.contributed || {}
    raw.content = raw.content || ''
    Object.assign(this, raw)
  }

  setScraped (scraped) {
    merge(this.scraped, scraped)
  }

  setContributed (contributed) { merge(this.contributed, contributed) }

  setContent (content) {
    this.content = Buffer.isBuffer(content) ? content.toString() : content
  }

  getMeta (path) {
    if (!path)
      return merge({}, this.scraped, this.contributed)
    return get(this.contributed, path) || get(this.scraped, path)
  }

  render () {
    const {
      scraped,
      contributed
    } = this
    const content = this.content || placeholderContent
    try {
      return grayMatter.stringify(content, { scraped, contributed })
    } catch (err) {
      dbg('could not stringify', { scraped, contributed })
      throw err
    }
  }

  get path () {
    if (!this.getMeta('name'))
      throw new Error('getPath requires project name')
    return `projects/${this.getMeta('name')}.md`
  }

  async rmFile () {
    await unlink(this.path)
  }

  async write () {
    await writeFile(this.path, this.render(), 'utf8')
  }

  async loadFile () {
    let file
    try {
      file = await readFile(this.path, 'utf8')
    } catch (err) {
      if (err.code === 'ENOENT')
        return
      throw err
    }
    const {
      data: {
        scraped,
        contributed
      },
      content
    } = grayMatter(file)
    Object.assign(this, { scraped, contributed, content })
  }

  static fromRaw (raw) {
    const {
      data: {
        scraped,
        contributed
      },
      content
    } = grayMatter(raw)
    return new Project({ scraped, contributed, content })
  }

  static async fromProjectName (name) {
    const path = `projects/${name}.md`
    let raw
    try {
      raw = await readFile(path, 'utf8')
    } catch (err) {
      if (err.code === 'ENOENT')
        return new Project()
      throw err
    }
    return Project.fromRaw(raw)
  }

  static async fromFileName (file) {
    const path = `projects/${file}`
    const raw = await readFile(path, 'utf8')

    return Project.fromRaw(raw)
  }
}
