const path = require('path')
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig')

const config = createJestConfig(
  relativePath => path.resolve(__dirname, 'node_modules', 'react-scripts', relativePath),
  __dirname,
  false
)

config.setupFilesAfterEnv.push(path.join(__dirname, 'src', 'setupTests.ts'))

module.exports = config
