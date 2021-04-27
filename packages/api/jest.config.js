const path = require('path')

module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    path.join(__dirname, 'test', 'setup.ts'),
  ]
};
