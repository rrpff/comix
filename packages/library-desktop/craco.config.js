const path = require("path")

module.exports = {
  webpack: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
    },
  },
  jest: {
    configure: (existing) => ({
      ...existing,
      roots: [
        ...existing.roots,
        path.join(__dirname, 'server'),
      ],
      testMatch: [
        ...existing.testMatch,
        path.join(__dirname, 'server', '__tests__', '**', '*.{js,jsx,ts,tsx}'),
        path.join(__dirname, 'server', '**', '*.{spec,test}.{js,jsx,ts,tsx}'),
      ],
      setupFilesAfterEnv: [
        ...(existing.setupFilesAfterEnv || []),
        path.join(__dirname, 'src', 'setupTests.ts'),
      ],
    })
  }
}
