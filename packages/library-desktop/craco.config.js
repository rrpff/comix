const path = require("path")

module.exports = {
  webpack: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
    },
  },
  jest: {
    config: (existing) => ({
      ...existing,
      setupFilesAfterEnv: [
        ...(existing.setupFilesAfterEnv || []),
        path.join(__dirname, 'src', 'setupTests.ts')
      ]
    })
  }
}
