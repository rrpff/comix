module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  watchPathIgnorePatterns: ['node_modules', 'test/fixtures/outputs'],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)",
  ]
};
