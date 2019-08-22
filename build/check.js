const fs = require('fs')
const chalk = require('chalk')

const MAX_BYTES = 13312;
const filename = './dist/zipped/game.zip'

function getSizeInBytes(filename) {
  return fs.statSync(filename).size
}

fileSize = getSizeInBytes(filename)
fileSizeDifference = Math.abs(MAX_BYTES - fileSize)

if (fileSize <= MAX_BYTES) {
  console.log(chalk.green(`File is ${fileSize} bytes (${fileSizeDifference} bytes under the limit).`))
  process.exit(0)
} else {
  console.log(chalk.red(`File is ${fileSize} bytes (${fileSizeDifference} bytes over the limit).`))
  process.exit(1)
}
