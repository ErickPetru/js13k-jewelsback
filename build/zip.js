const fs = require('fs')
const archiver = require('archiver')

const dir = process.cwd() + '/dist';
const output = fs.createWriteStream(dir + '/zipped/game.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.file(dir + '/inlined/index.html', { name: 'index.html' });

archive.finalize();
