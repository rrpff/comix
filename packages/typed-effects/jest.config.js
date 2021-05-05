module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)",
  ]
};
