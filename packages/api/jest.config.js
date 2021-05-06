const path = require('path')

module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    path.join(__dirname, 'test', 'setup.ts'),
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)",
    "<rootDir>/test/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};
