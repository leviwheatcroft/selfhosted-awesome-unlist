const Metalsmith = require('metalsmith')
const debug = require('debug')
const config = require('config')

const dbg = debug('metalsmith-build')

module.exports = async function buildContent () {
  dbg('building')
  const metalsmith = Metalsmith('projects')
  metalsmith.source('')
  metalsmith.clean(false)
  metalsmith.destination('build')
  metalsmith.metadata(config.get('meta'))
  try {
    await metalsmith.build()
  } catch (err) {
    dbg(err)
    throw new Error('metalsmith build error')
  }
  dbg('build success')
}
