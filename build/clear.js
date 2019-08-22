const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

rimraf.sync('./dist')
mkdirp.sync('./dist/bundled')
mkdirp.sync('./dist/inlined')
mkdirp.sync('./dist/zipped')
