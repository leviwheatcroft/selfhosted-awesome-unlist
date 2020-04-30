const grayMatter = require('gray-matter')
const {
  merge,
  get
} = require('lodash')
const {
  promises: {
    readFile,
    writeFile,
    readdir,
    unlink
  }
} = require('fs')
const debug = require('debug')
const asyncPool = require('tiny-async-pool')


// eslint-disable-next-line no-unused-vars
const dbg = debug('sau')

class Project {
  constructor (raw = {}) {
    raw.meta = raw.data || {}
    delete raw.data
    raw.content = Buffer.from(raw.content || '')
    const { name } = raw.meta
    const existing = Project.projects[name]
    if (existing) {
      raw.meta = merge(existing.meta, raw.meta)
      raw.content = Buffer.concat([raw.content, existing.content])
    }
    Object.assign(this, raw)
    Project.projects[name] = this
  }

  setMeta (meta) {
    merge(this.meta, meta)
  }

  setContent (content) {
    if (!Buffer.isBuffer(content))
      // eslint-disable-next-line no-param-reassign
      content = Buffer.from(content)
    this.content = Buffer.concat([this.content, content])
  }

  getMeta (path) {
    if (!path)
      return this.meta
    return get(this.meta, path)
  }

  render () {
    const content = this.content.toString()
    try {
      return grayMatter.stringify(content, this.meta)
    } catch (err) {
      dbg('could not stringify', this.meta)
      throw err
    }
  }

  // get path () {
  //   if (!this.getMeta('name'))
  //     throw new Error('getPath requires project name')
  //   return `projects/${this.getMeta('name')}.md`
  // }

  async removeScraped () {
    const name = this.getMeta('name')
    if (!name) {
      dbg(this.meta)
      throw new Error('can\'t remove project without name')
    }
    const path = `projects/scraped/${this.getMeta('name')}.md`
    await unlink(path)
  }

  async writeScraped () {
    const name = this.getMeta('name')
    if (!name) {
      dbg(this.meta)
      throw new Error('can\'t write project without name')
    }
    const path = `projects/scraped/${this.getMeta('name')}.md`
    await writeFile(path, this.render(), 'utf8')
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
    return new Project(grayMatter(raw))
  }

  // static async fromProjectName (name) {
  //   const path = `projects/${name}.md`
  //   let raw
  //   try {
  //     raw = await readFile(path, 'utf8')
  //   } catch (err) {
  //     if (err.code === 'ENOENT')
  //       return new Project()
  //     throw err
  //   }
  //   return Project.fromRaw(raw)
  // }
  //
  // static async fromFileName (file) {
  //   const path = `projects/${file}`
  //   const raw = await readFile(path, 'utf8')
  //
  //   return Project.fromRaw(raw)
  // }
}

Project.readAll = async function readAll (paths = ['scraped', 'contributed']) {
  // eslint-disable-next-line no-param-reassign
  paths = [].concat(paths)
  dbg('paths', paths)
  while (paths.length) {
    const path = `projects/${paths.shift()}`
    // eslint-disable-next-line no-await-in-loop
    await asyncPool(6, await readdir(path), async (file) => {
      if (file === '.gitignore')
        return
      dbg('read', file)
      Project.fromRaw(await readFile(`${path}/${file}`))
    })
  }
  dbg(Project.projects)
}

Project.projects = {}

module.exports = Project
