const fs = require('fs')
const path = require('path')

const deployTokenPath = path.resolve(__dirname, '..', '.deploy-token')
const deployToken = `${Date.now()}`

fs.writeFileSync(deployTokenPath, `${deployToken}\n`)

console.log(`Wrote ${deployTokenPath}`)