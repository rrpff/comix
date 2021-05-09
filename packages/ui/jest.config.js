module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    './test/setup.ts'
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)",
    "<rootDir>/test/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};
