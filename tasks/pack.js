const shell = require('shelljs')
const version = require('../dist/manifest.json').version

const fileName = `wakaras-${version}`

shell.exec(`zip -9 -r packages/${fileName}.zip dist/*`)
