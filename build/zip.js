const fs = require('fs')
const archiver = require('archiver')

const dir = process.cwd() + '/dist';
const output = fs.createWriteStream(dir + '/zipped/game.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.file(dir + '/inlined/index.html', { name: 'index.html' });

if (process.env.npm_config_assets) {
  let files = fs.readdirSync(dir + '/inlined/')
  files = files.filter(f => (/\.(webp|gif|jpe?g|png|mp3|ogg)$/i).test(f))
  files.forEach(f => archive.file(dir + '/inlined/' + f, { name: f }))
}

archive.finalize();
